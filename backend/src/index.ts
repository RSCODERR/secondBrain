import dns from "dns";
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDB from "./database/database";
import { User } from "./models/user.model";
import { content } from "./models/content.model";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userMiddleware from "./middlewares/userMiddleware";
import crypto from "crypto"; 
import cors from "cors";
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail, sendBugReportEmail, sendContactEmail } from "./utils/mailer";

const app = express();

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            "https://second-brain-eight-delta.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ];

        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(cookieParser());

app.post("/api/v1/signup", async (req, res) => {
    const requiredBody = z.object({
        username: z.string().min(4, "Username too short").max(25, "Username too long"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters").max(25, "Password too long"),
        pendingUserId: z.string().optional() // Tracks previous unverified account to clean up on re-edit
    });

    const parsedData = requiredBody.safeParse(req.body);
    
    if(!parsedData.success){
        const firstError = parsedData.error.issues?.[0]?.message || "Incorrect format";
        return res.status(400).json({
            error: firstError,
            details: parsedData.error
        });
    }

    const { username, email, password, pendingUserId } = parsedData.data;
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    try {
        // If the user went back to edit after signup and both email+username changed,
        // clean up the old ghost unverified account using the pendingUserId from the previous response.
        if (pendingUserId && mongoose.Types.ObjectId.isValid(pendingUserId)) {
            const ghostAccount = await User.findById(pendingUserId);
            if (ghostAccount && !ghostAccount.isEmailVerified) {
                // Only delete if this ghost account doesn't match the new email/username
                // (i.e., it really is a stale old attempt, not the same account)
                const isStaleGhost =
                    ghostAccount.email !== cleanEmail && ghostAccount.username !== cleanUsername;
                if (isStaleGhost) {
                    await User.deleteOne({ _id: ghostAccount._id });
                    console.log(`[Signup] Cleaned up stale unverified account: ${ghostAccount.email}`);
                }
            }
        }

        const existingEmailUser = await User.findOne({ email: cleanEmail });
        const existingUsernameUser = await User.findOne({ username: cleanUsername });

        // 1. Check if a verified account already owns this email
        if (existingEmailUser && existingEmailUser.isEmailVerified) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        // 2. Check if a verified account already owns this username
        if (existingUsernameUser && existingUsernameUser.isEmailVerified) {
            return res.status(409).json({ error: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // 3. Handle unverified account with this email (user re-attempting signup or editing details)
        if (existingEmailUser && !existingEmailUser.isEmailVerified) {
            if (existingUsernameUser && existingUsernameUser._id.toString() !== existingEmailUser._id.toString()) {
                await User.deleteOne({ _id: existingUsernameUser._id });
            }

            existingEmailUser.username = cleanUsername;
            existingEmailUser.password = hashedPassword;
            existingEmailUser.verificationCode = otpCode;
            existingEmailUser.verificationExpiresAt = verificationExpiresAt;
            await existingEmailUser.save();

            sendVerificationEmail(cleanEmail, cleanUsername, otpCode).catch((err) => {
                console.error("[Signup] Error sending verification email:", err);
            });

            return res.status(200).json({
                msg: "Registration updated! Please check your email for the verification code.",
                email: cleanEmail,
                requiresVerification: true,
                pendingUserId: existingEmailUser._id.toString(),
                user: {
                    id: existingEmailUser._id,
                    username: existingEmailUser.username,
                    email: existingEmailUser.email,
                    isEmailVerified: false
                }
            });
        }

        // 4. Handle unverified account with this username (user went back to fix email typo)
        if (existingUsernameUser && !existingUsernameUser.isEmailVerified) {
            existingUsernameUser.email = cleanEmail;
            existingUsernameUser.password = hashedPassword;
            existingUsernameUser.verificationCode = otpCode;
            existingUsernameUser.verificationExpiresAt = verificationExpiresAt;
            await existingUsernameUser.save();

            sendVerificationEmail(cleanEmail, cleanUsername, otpCode).catch((err) => {
                console.error("[Signup] Error sending verification email:", err);
            });

            return res.status(200).json({
                msg: "Registration updated! Please check your email for the verification code.",
                email: cleanEmail,
                requiresVerification: true,
                pendingUserId: existingUsernameUser._id.toString(),
                user: {
                    id: existingUsernameUser._id,
                    username: existingUsernameUser.username,
                    email: existingUsernameUser.email,
                    isEmailVerified: false
                }
            });
        }

        // 5. Brand new user registration
        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            isEmailVerified: false,
            verificationCode: otpCode,
            verificationExpiresAt
        });

        // Send OTP email asynchronously
        sendVerificationEmail(cleanEmail, cleanUsername, otpCode).catch((err) => {
            console.error("[Signup] Error sending verification email:", err);
        });

        return res.status(201).json({
            msg: "Registration successful! Please check your email for the verification code.",
            email: cleanEmail,
            requiresVerification: true,
            pendingUserId: user._id.toString(),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isEmailVerified: false
            }
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
});

// Verify email with 6-digit OTP code
app.post("/api/v1/verify-email", async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: "Email and verification code are required" });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const cleanCode = String(code).trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({ error: "User account not found" });
        }

        if (user.isEmailVerified) {
            return res.json({ msg: "Email is already verified", verified: true });
        }

        if (!user.verificationCode || user.verificationCode !== cleanCode) {
            return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
        }

        if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
        }

        user.isEmailVerified = true;
        user.verificationCode = null;
        user.verificationExpiresAt = null;
        await user.save();

        // Issue auth cookie immediately so the user doesn't have to log in separately
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            msg: "Email verified successfully! Welcome to Second Brain.",
            verified: true,
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error during verification" });
    }
});

// Resend OTP email with rate limiting
app.post("/api/v1/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.json({ msg: "Email is already verified", verified: true });
        }

        const otpCode = generateOTP();
        user.verificationCode = otpCode;
        user.verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(cleanEmail, user.username, otpCode);

        return res.json({ msg: "A fresh verification code has been sent to your email." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Could not resend verification email" });
    }
});

// Initiate password reset: sends 6-digit OTP code to user's email
app.post("/api/v1/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email address is required" });
        }

        const emailSchema = z.string().email();
        const parsed = emailSchema.safeParse(String(email).trim());
        if (!parsed.success) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }

        const cleanEmail = parsed.data.toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        // Security best practice: Prevent user enumeration
        if (!user) {
            return res.json({
                msg: "If an account with this email exists, a password reset code has been sent."
            });
        }

        const resetCode = generateOTP();
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        sendPasswordResetEmail(cleanEmail, user.username, resetCode).catch((err) => {
            console.error("[ForgotPassword] Error sending reset email:", err);
        });

        return res.json({
            msg: "If an account with this email exists, a password reset code has been sent."
        });
    } catch (error) {
        console.error("[ForgotPassword] Error:", error);
        return res.status(500).json({ error: "Unable to process password reset request" });
    }
});

// Complete password reset: validates OTP code and updates password
app.post("/api/v1/reset-password", async (req, res) => {
    try {
        const resetSchema = z.object({
            email: z.string().email("Invalid email format"),
            code: z.string().length(6, "Verification code must be 6 digits"),
            newPassword: z.string().min(6, "Password must be at least 6 characters").max(25, "Password too long")
        });

        const parsed = resetSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
            return res.status(400).json({ error: firstError });
        }

        const { email, code, newPassword } = parsed.data;
        const cleanEmail = email.trim().toLowerCase();
        const cleanCode = code.trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or reset code" });
        }

        if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
            return res.status(400).json({ error: "Invalid reset code. Please double check and try again." });
        }

        if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
            return res.status(400).json({ error: "Reset code has expired. Please request a new code." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpiresAt = null;

        // Resetting password via email OTP also validates email ownership
        if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            user.verificationCode = null;
            user.verificationExpiresAt = null;
        }

        await user.save();

        return res.json({
            msg: "Password updated successfully. You can now sign in with your new password."
        });
    } catch (error) {
        console.error("[ResetPassword] Error:", error);
        return res.status(500).json({ error: "Server error while resetting password" });
    }
});

app.post("/api/v1/signin", async (req, res) => {
     const identifier = (req.body.identifier || req.body.username || req.body.email || "").trim().toLowerCase();
     const { password, rememberMe } = req.body;

     if(!identifier || !password){
       return res.status(400).json({
        error: "Username/Email and password are required"
       });
     }

     const user = await User.findOne({
        $or: [
            { username: identifier },
            { email: identifier }
        ]
     });

     if(!user){
       return res.status(401).json({
            error: "Invalid username or password"
        });
     }

     const passwordMatch = await bcrypt.compare(password, user.password);

     if(!passwordMatch){
        return res.status(401).json({
            error: "Invalid username or password"
        });
     }

     // If email is not yet verified, request verification
     if (!user.isEmailVerified) {
        // Send a fresh code if expired or missing
        if (!user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
            const otpCode = generateOTP();
            user.verificationCode = otpCode;
            user.verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();
            sendVerificationEmail(user.email, user.username, otpCode).catch(console.error);
        }

        return res.status(403).json({
            error: "Please verify your email address to continue",
            requiresVerification: true,
            email: user.email,
            username: user.username
        });
     }

     const tokenExpiry = rememberMe ? "7d" : "1d";
     const token = jwt.sign({ id: user.id, username: user.username}, process.env.JWT_SECRET!,{expiresIn: tokenExpiry});

     const isProduction = process.env.NODE_ENV === "production";

     interface CookieOpts {
       httpOnly: boolean;
       secure: boolean;
       sameSite: "none" | "lax" | "strict" | boolean;
       maxAge?: number;
     }

     const cookieOptions: CookieOpts = {
      httpOnly: true,
      secure: isProduction,        
      sameSite: isProduction ? "none" : "lax",
     };

     if (rememberMe) {
       cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
     }

     res.cookie("token", token, cookieOptions);

     res.status(200).json({
        msg: "Logged in successfully",
        token: token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
     });

});

app.get("/api/v1/me", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({
            authenticated: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/v1/logout", (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
    return res.json({ message: "Logged out successfully" });
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { title, link, note, type } = req.body;

    // @ts-ignore
    if (!req.userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!type || !title) {
      return res.status(400).json({
        message: "type and title are required"
      });
    }

    if (type === "note" && !note) {
      return res.status(400).json({
        message: "note content is required"
      });
    }

    if (type !== "note" && !link) {
      return res.status(400).json({
        message: "link is required"
      });
    }

    await content.create({
      title,
      type,
      link: type === "note" ? null : link,
      note: type === "note" ? note : null,
      // @ts-ignore
      userId: req.userId,
      tags: []
    });

    res.json({
      message: "content added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});


app.get("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const contents = await content.find({ userId });

        return res.json({ contents });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
    });


app.delete("/api/v1/content/:id", userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;

        const deleted = await content.deleteOne({
          _id: contentId,
          userId
        });

        if (deleted.deletedCount === 0) {
          return res.status(404).json({
            message: "content not found or not authorized"
          });
        }

        return res.json({
          message: "content deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.put("/api/v1/content/:id", userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;
        const { title, link, type, note } = req.body;

        if (!title || !type) {
            return res.status(400).json({
                message: "title and type are required"
            });
        }

        if (type === "note" && !note) {
            return res.status(400).json({
                message: "note content is required"
            });
        }

        if (type !== "note" && !link) {
            return res.status(400).json({
                message: "link is required"
            });
        }

        const updated = await content.findOneAndUpdate(
            { _id: contentId, userId },
            {
                title,
                type,
                link: type === "note" ? null : link,
                note: type === "note" ? note : null
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "content not found or not authorized"
            });
        }

        return res.json({
            message: "content updated successfully",
            content: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
});

app.post("/api/v1/brain/share",userMiddleware, async (req,res) => {
    try {
        //@ts-ignore
        const userId = req.userId;

        const shareLink = crypto.randomBytes(8).toString("hex");

        const shareLinkExpiresAt= new Date(Date.now()+ 24 * 60 * 60 * 1000);

        await User.updateOne(
            {_id: userId},
            { 
                shareLink,
                shareLinkExpiresAt
            }
        );

        return res.json({
            shareLink,
            shareLinkExpiresAt
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    try {
        const { shareLink } = req.params;

        const user = await User.findOne({ shareLink });

        if (!user) {
            return res.status(404).json({ message: "Invalid share link" });
        }

        if (!user.shareLinkExpiresAt || user.shareLinkExpiresAt < new Date()) {
            return res.status(404).json({ message: "Share link expired" });
        }

        const contents = await content.find({
          userId: user._id
        });

        return res.json({
          username: user.username,
          contents
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
          message: "Internal server error"
        });
    }
    });

app.get("/api/v1/card/:id", async (req, res) => {
    try {
        const contentId = req.params.id;
        const item = await content.findById(contentId).populate("userId", "username");

        if (!item) {
            return res.status(404).json({ message: "Card not found" });
        }

        // @ts-ignore
        const username = item.userId?.username || "A Second Brain user";

        return res.json({
            content: {
                _id: item._id,
                title: item.title,
                type: item.type,
                link: item.link,
                note: item.note
            },
            username
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Invalid card ID or server error"
        });
    }
});



// Check if a username is available
app.get("/api/v1/check-username", async (req, res) => {
    try {
        const username = (req.query.username as string || "").trim().toLowerCase();

        if (!username || username.length < 4 || username.length > 25) {
            return res.status(400).json({ available: false, error: "Username must be 4-25 characters" });
        }

        const existing = await User.findOne({ username });
        return res.json({ available: !existing });
    } catch (error) {
        return res.status(500).json({ available: false, error: "Server error" });
    }
});

// Change the authenticated user's username
app.put("/api/v1/user/username", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { newUsername } = req.body;

        if (!newUsername || typeof newUsername !== "string") {
            return res.status(400).json({ error: "New username is required" });
        }

        const trimmed = newUsername.trim().toLowerCase();

        if (trimmed.length < 4 || trimmed.length > 25) {
            return res.status(400).json({ error: "Username must be 4-25 characters" });
        }

        // Check if already taken by someone else
        const existing = await User.findOne({ username: trimmed });
        if (existing && existing._id.toString() !== userId) {
            return res.status(409).json({ error: "Username already taken" });
        }

        await User.updateOne({ _id: userId }, { username: trimmed });

        return res.json({ msg: "Username updated successfully", username: trimmed });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Delete the authenticated user's account (requires password confirmation)
app.delete("/api/v1/user", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "Password is required to delete account" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Delete all content belonging to this user
        await content.deleteMany({ userId });

        // Delete the user
        await User.deleteOne({ _id: userId });

        // Clear auth cookie
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        return res.json({ msg: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Health check endpoint that keeps Render awake and pings MongoDB Atlas
app.get("/api/v1/health", async (_req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const isDbReady = dbState === 1;
        if (isDbReady && mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
        }
        res.status(200).json({
            status: "ok",
            uptime: Math.floor(process.uptime()),
            db: isDbReady ? "connected" : "connecting"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// ─── Report a Bug ────────────────────────────────────────────────────────────
app.post("/api/v1/report-bug", userMiddleware, async (req, res) => {
    const schema = z.object({
        category: z.enum(["ui", "auth", "content", "performance", "other"]),
        title: z.string().min(3, "Title too short").max(120, "Title too long"),
        description: z.string().min(10, "Please provide more detail").max(2000, "Description too long"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    }

    const { category, title, description } = parsed.data;
    // @ts-ignore
    const userId = req.userId;

    try {
        const user = await User.findById(userId).select("username email");
        if (!user) return res.status(401).json({ error: "User not found" });

        const sent = await sendBugReportEmail({
            category,
            title,
            description,
            username: user.username,
            userEmail: user.email,
        });

        if (!sent) {
            return res.status(500).json({ error: "Failed to send report. Please try again." });
        }

        return res.status(200).json({ msg: "Bug report sent successfully. Thank you!" });
    } catch (err) {
        console.error("[Report Bug] Error:", err);
        return res.status(500).json({ error: "An unexpected error occurred." });
    }
});

// ─── Contact Us Inbound Dispatcher ──────────────────────────────────────────
app.post("/api/v1/contact", async (req, res) => {
    const schema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name too long"),
        email: z.string().email("Please provide a valid email address"),
        subject: z.string().min(3, "Subject must be at least 3 characters").max(120, "Subject too long"),
        category: z.string().max(40).optional(),
        message: z.string().min(10, "Message must be at least 10 characters").max(3000, "Message too long"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    }

    const { name, email, subject, category, message } = parsed.data;

    try {
        const sent = await sendContactEmail({
            name,
            email,
            subject,
            category,
            message,
        });

        if (!sent) {
            return res.status(500).json({
                error: "Failed to dispatch message right now. You can email us directly at secondbrain.in.app@gmail.com."
            });
        }

        return res.status(200).json({ msg: "Message dispatched successfully! We'll reply to your email soon." });
    } catch (err) {
        console.error("[Contact Us] Error:", err);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
});

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Keep-Alive self-ping: Runs every 14 minutes in production to prevent Render spin-down
const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || "https://secondbrain-pur4.onrender.com";
if (process.env.NODE_ENV === "production" || process.env.ENABLE_KEEP_ALIVE === "true") {
    console.log(`[KeepAlive] Scheduled to ping ${KEEP_ALIVE_URL}/api/v1/health every 14 minutes`);
    setInterval(async () => {
        try {
            const response = await fetch(`${KEEP_ALIVE_URL}/api/v1/health`);
            console.log(`[KeepAlive] Pinged ${KEEP_ALIVE_URL}/api/v1/health - Status: ${response.status}`);
        } catch (err) {
            console.error("[KeepAlive] Self-ping failed:", err);
        }
    }, 14 * 60 * 1000);
}