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
import { Tag } from "./models/tag.model";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userMiddleware from "./middlewares/userMiddleware";
import crypto from "crypto"; 
import cors from "cors";
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail, sendBugReportEmail, sendContactEmail } from "./utils/mailer";
import { askBrain, summarizeCard, suggestTags, semanticSearch } from "./services/aiService";
import { getRedisClient, closeRedis } from "./database/redis";
import {
    loginRateLimiter,
    signupRateLimiter,
    forgotPasswordRateLimiter,
    resetPasswordRateLimiter,
    aiRateLimiter,
    generalRateLimiter
} from "./middlewares/rateLimiters";

const app = express();

// Reverse proxy configuration: honors X-Forwarded-For when behind Render/Vercel/Cloudflare
const trustProxySetting = process.env.TRUST_PROXY ?? (process.env.NODE_ENV === "production" ? "1" : "false");
if (trustProxySetting === "true") {
    app.set("trust proxy", true);
} else if (trustProxySetting === "false") {
    app.set("trust proxy", false);
} else if (!isNaN(Number(trustProxySetting))) {
    app.set("trust proxy", Number(trustProxySetting));
} else {
    app.set("trust proxy", trustProxySetting);
}

// Initialize Redis client connection in background (non-blocking)
getRedisClient();

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(cookieParser());

app.post("/api/v1/signup", signupRateLimiter, async (req, res) => {
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
app.post("/api/v1/verify-email", generalRateLimiter, async (req, res) => {
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
app.post("/api/v1/resend-verification", generalRateLimiter, async (req, res) => {
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
app.post("/api/v1/forgot-password", forgotPasswordRateLimiter, async (req, res) => {
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
app.post("/api/v1/reset-password", resetPasswordRateLimiter, async (req, res) => {
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

app.post("/api/v1/signin", loginRateLimiter, async (req, res) => {
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

app.get("/api/v1/me", generalRateLimiter, userMiddleware, async (req, res) => {
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

app.post("/api/v1/logout", generalRateLimiter, (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
    return res.json({ message: "Logged out successfully" });
});

// Helper to resolve tag titles into ObjectIds
async function resolveTagIds(rawTags: any[]): Promise<mongoose.Types.ObjectId[]> {
  if (!Array.isArray(rawTags)) return [];
  const tagIds: mongoose.Types.ObjectId[] = [];

  // Flatten any comma-separated strings
  const expanded: any[] = [];
  for (const item of rawTags) {
    if (typeof item === "string" && item.includes(",")) {
      item.split(",").forEach((s) => expanded.push(s));
    } else {
      expanded.push(item);
    }
  }

  for (const item of expanded) {
    if (!item) continue;

    // If item is already an ObjectId or object with _id
    if (typeof item === "object" && item._id && mongoose.Types.ObjectId.isValid(item._id)) {
      const idStr = item._id.toString();
      if (!tagIds.some((id) => id.toString() === idStr)) {
        tagIds.push(new mongoose.Types.ObjectId(idStr));
      }
      continue;
    }

    if (typeof item === "string" && mongoose.Types.ObjectId.isValid(item) && item.length === 24) {
      const byId = await Tag.findById(item);
      if (byId) {
        if (!tagIds.some((id) => id.toString() === byId._id.toString())) {
          tagIds.push(byId._id as mongoose.Types.ObjectId);
        }
        continue;
      }
    }

    let title = "";
    if (typeof item === "string") {
      title = item.trim().toLowerCase();
    } else if (item && typeof item === "object" && item.title) {
      title = String(item.title).trim().toLowerCase();
    }
    title = title.replace(/^#+/, "").trim();
    if (!title) continue;

    let tagDoc = await Tag.findOne({ title });
    if (!tagDoc) {
      try {
        tagDoc = await Tag.create({ title });
      } catch {
        tagDoc = await Tag.findOne({ title });
      }
    }
    if (tagDoc && !tagIds.some((id) => id.toString() === tagDoc._id.toString())) {
      tagIds.push(tagDoc._id as mongoose.Types.ObjectId);
    }
  }
  return tagIds;
}

/**
 * Automatically cleans up tags that have 0 references across all content documents in the database.
 * If candidateTagIds is provided, only evaluates those specific tags.
 * Otherwise, performs a global cleanup of all unreferenced tags in the database.
 *
 * Rules:
 * - If usage count == 0: Tag is deleted from MongoDB Tag collection.
 * - If usage count >= 1: Tag is kept in MongoDB Tag collection.
 */
export async function cleanupOrphanedTags(
  candidateTagIds?: (mongoose.Types.ObjectId | string)[]
): Promise<number> {
  try {
    if (candidateTagIds && candidateTagIds.length > 0) {
      const validIds = candidateTagIds
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id.toString()))
        .map((id) => new mongoose.Types.ObjectId(id.toString()));

      if (validIds.length === 0) return 0;

      // Find which candidate tags are still referenced by at least 1 content document
      const stillUsedIds = await content.distinct("tags", { tags: { $in: validIds } });
      const stillUsedSet = new Set(
        stillUsedIds.filter(Boolean).map((id: any) => id.toString())
      );

      // Identify tags that now have 0 usages across the entire database
      const toDelete = validIds.filter((id) => !stillUsedSet.has(id.toString()));

      if (toDelete.length > 0) {
        const result = await Tag.deleteMany({ _id: { $in: toDelete } });
        console.log(`[Tag Cleanup] Removed ${result.deletedCount} unused tag(s) with 0 references.`);
        return result.deletedCount || 0;
      }
      return 0;
    }

    // Global cleanup: delete all tags in the Tag collection not referenced by any content document
    const activeTagIds = (await content.distinct("tags")).filter(Boolean);
    const result = await Tag.deleteMany({ _id: { $nin: activeTagIds } });
    if (result.deletedCount && result.deletedCount > 0) {
      console.log(`[Tag Cleanup] Purged ${result.deletedCount} orphaned tag(s) from database.`);
    }
    return result.deletedCount || 0;
  } catch (error) {
    console.error("[Tag Cleanup] Error cleaning up orphaned tags:", error);
    return 0;
  }
}

app.post("/api/v1/content", generalRateLimiter, userMiddleware, async (req, res) => {
  try {
    const { title, link, note, type, tags: rawTags, pinned } = req.body;

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

    const tagIds = await resolveTagIds(rawTags);

    const createdContent = await content.create({
      title,
      type,
      link: type === "note" ? null : link,
      note: type === "note" ? note : null,
      // @ts-ignore
      userId: req.userId,
      tags: tagIds,
      pinned: Boolean(pinned)
    });

    const populated = await content.findById(createdContent._id).populate("tags", "title");

    res.json({
      message: "content added successfully",
      content: populated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});


app.get("/api/v1/content", generalRateLimiter, userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const contents = await content.find({ userId })
          .populate("tags", "title")
          .sort({ pinned: -1, _id: -1 });

        return res.json({ contents });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
});


app.delete("/api/v1/content/:id", generalRateLimiter, userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;

        const targetContent = await content.findOne({
          _id: contentId,
          userId
        });

        if (!targetContent) {
          return res.status(404).json({
            message: "content not found or not authorized"
          });
        }

        const removedTagIds = targetContent.tags || [];

        await content.deleteOne({
          _id: contentId,
          userId
        });

        // If any tags on this deleted content have 0 remaining usages in the DB, delete them from Tag collection
        if (removedTagIds.length > 0) {
          await cleanupOrphanedTags(removedTagIds);
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

app.put("/api/v1/content/:id", generalRateLimiter, userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;
        const { title, link, type, note, tags: rawTags, pinned } = req.body;

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

        const updateData: any = {
            title,
            type,
            link: type === "note" ? null : link,
            note: type === "note" ? note : null
        };

        let previousTagIds: any[] = [];
        if (rawTags !== undefined) {
            const existing = await content.findOne({ _id: contentId, userId }).select("tags");
            if (existing && Array.isArray(existing.tags)) {
                previousTagIds = existing.tags;
            }
            updateData.tags = await resolveTagIds(rawTags);
        }

        if (pinned !== undefined) {
            updateData.pinned = Boolean(pinned);
        }

        const updated = await content.findOneAndUpdate(
            { _id: contentId, userId },
            updateData,
            { new: true }
        ).populate("tags", "title");

        if (!updated) {
            return res.status(404).json({
                message: "content not found or not authorized"
            });
        }

        // If any tags were removed during edit, clean them up if they now have 0 usages
        if (rawTags !== undefined && previousTagIds.length > 0) {
            const currentTagIdStrings = (updated.tags || []).map((t: any) =>
                (t._id || t).toString()
            );
            const removedTagIds = previousTagIds.filter(
                (oldId: any) => !currentTagIdStrings.includes(oldId.toString())
            );
            if (removedTagIds.length > 0) {
                await cleanupOrphanedTags(removedTagIds);
            }
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

const togglePinHandler = async (req: express.Request, res: express.Response) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;

        const item = await content.findOne({ _id: contentId, userId });
        if (!item) {
            return res.status(404).json({ message: "Content not found or not authorized" });
        }

        item.pinned = !item.pinned;
        await item.save();

        const populated = await content.findById(item._id).populate("tags", "title");

        return res.json({
            message: item.pinned ? "Pinned to top" : "Unpinned",
            pinned: item.pinned,
            content: populated
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

app.patch("/api/v1/content/:id/pin", generalRateLimiter, userMiddleware, togglePinHandler);
app.put("/api/v1/content/:id/pin", generalRateLimiter, userMiddleware, togglePinHandler);

app.get("/api/v1/tags", generalRateLimiter, userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        // Ensure database has no orphaned tags
        await cleanupOrphanedTags();

        const userContents = await content.find({ userId }).select("tags");
        const tagIdCountMap = new Map<string, number>();

        userContents.forEach((c) => {
            if (Array.isArray(c.tags)) {
                c.tags.forEach((tagId: any) => {
                    const idStr = tagId.toString();
                    tagIdCountMap.set(idStr, (tagIdCountMap.get(idStr) || 0) + 1);
                });
            }
        });

        const tagIds = Array.from(tagIdCountMap.keys());
        const tagDocs = await Tag.find({ _id: { $in: tagIds } }).sort({ title: 1 });

        const tagsWithCount = tagDocs.map((t) => ({
            _id: t._id,
            title: t.title,
            count: tagIdCountMap.get(t._id.toString()) || 0
        }));

        return res.json({ tags: tagsWithCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/v1/ai/chat", aiRateLimiter, userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { message, history } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Fetch user's content to provide brain context
        const userContents = await content.find({ userId })
            .populate("tags", "title")
            .sort({ pinned: -1, _id: -1 })
            .limit(60);

        const result = await askBrain({
            message: message.trim(),
            history: Array.isArray(history) ? history : [],
            contents: userContents
        });

        return res.json({
            reply: result.reply,
            referencedCards: result.referencedCards,
            provider: result.providerUsed,
            model: result.modelUsed
        });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to generate AI response. Please try again."
        });
    }
});

app.post("/api/v1/ai/summarize", aiRateLimiter, async (req, res) => {
    try {
        const { cardId, title, type, link, note, tags } = req.body;

        let cardTitle = title;
        let cardType = type;
        let cardLink = link;
        let cardNote = note;
        let cardTags = tags;

        if (cardId) {
            const existing = await content.findById(cardId).populate("tags", "title");
            if (existing) {
                cardTitle = existing.title || cardTitle;
                cardType = existing.type || cardType;
                cardLink = existing.link || cardLink;
                cardNote = existing.note || cardNote;
                cardTags = existing.tags || cardTags;
            }
        }

        if (!cardTitle && !cardNote && !cardLink) {
            return res.status(400).json({
                message: "Card title, note, or link is required for summarization"
            });
        }

        const result = await summarizeCard({
            title: cardTitle || "Untitled Memory",
            type: cardType || "note",
            link: cardLink,
            note: cardNote,
            tags: cardTags
        });

        return res.json({
            summary: result.summary,
            provider: result.provider,
            model: result.model
        });

    } catch (error: any) {
        console.error("AI Summarize Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to generate AI summary. Please try again."
        });
    }
});

app.post("/api/v1/ai/suggest-tags", aiRateLimiter, async (req, res) => {
    try {
        const { title, type, link, note, existingTags } = req.body;

        if (!title && !note && !link) {
            return res.status(400).json({
                message: "Please enter a title, note, or link before auto-suggesting tags."
            });
        }

        // Fetch known tags across system to help keep user taxonomy aligned
        let knownUserTags: string[] = [];
        try {
            const allTags = await Tag.find({}).limit(40).select("title");
            knownUserTags = allTags.map((t: any) => t.title);
        } catch {
            // fallback
        }

        const result = await suggestTags({
            title: title || "",
            type: type || "note",
            link: link || "",
            note: note || "",
            existingTags: Array.isArray(existingTags) ? existingTags : [],
            knownUserTags
        });

        return res.json({
            tags: result.tags,
            provider: result.provider,
            model: result.model
        });

    } catch (error: any) {
        console.error("AI Suggest Tags Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to suggest tags. Please try again."
        });
    }
});

app.post("/api/v1/ai/semantic-search", aiRateLimiter, async (req, res) => {
    try {
        const { query, contents: clientContents } = req.body;

        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({ message: "Search query is required." });
        }

        let searchPool = Array.isArray(clientContents) ? clientContents : [];

        // If client did not provide contents array, attempt to query authenticated user's contents
        if (searchPool.length === 0) {
            let token = req.cookies?.token;
            if (!token && req.headers.authorization?.startsWith("Bearer ")) {
                token = req.headers.authorization.substring(7);
            }

            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
                    searchPool = await content.find({ userId: decoded.id })
                        .populate("tags", "title")
                        .sort({ pinned: -1, _id: -1 })
                        .limit(60);
                } catch {
                    // token invalid
                }
            }
        }

        const result = await semanticSearch({
            query: query.trim(),
            contents: searchPool
        });

        return res.json({
            matches: result.matches,
            provider: result.provider,
            model: result.model
        });

    } catch (error: any) {
        console.error("AI Semantic Search Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to perform semantic search. Please try again."
        });
    }
});

app.post("/api/v1/brain/share", generalRateLimiter, userMiddleware, async (req,res) => {
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
        })
          .populate("tags", "title")
          .sort({ pinned: -1, _id: -1 });

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
        const item = await content.findById(contentId)
          .populate("userId", "username")
          .populate("tags", "title");

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
                note: item.note,
                tags: item.tags,
                pinned: item.pinned
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
app.put("/api/v1/user/username", generalRateLimiter, userMiddleware, async (req, res) => {
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
app.delete("/api/v1/user", generalRateLimiter, userMiddleware, async (req, res) => {
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

        // Clean up any tags that now have 0 references across the database
        await cleanupOrphanedTags();

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
app.post("/api/v1/report-bug", generalRateLimiter, userMiddleware, async (req, res) => {
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
app.post("/api/v1/contact", generalRateLimiter, async (req, res) => {
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

connectDB().then(() => {
    cleanupOrphanedTags().then((count) => {
        if (count > 0) {
            console.log(`[Startup] Cleaned up ${count} orphaned tag(s) from database.`);
        }
    }).catch((err) => {
        console.error("[Startup] Initial tag cleanup error:", err);
    });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
    console.log("[Shutdown] SIGTERM received. Closing Redis connection...");
    await closeRedis();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("[Shutdown] SIGINT received. Closing Redis connection...");
    await closeRedis();
    process.exit(0);
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

export { app };
export default app;