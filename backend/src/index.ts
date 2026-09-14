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

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["https://second-brain-eight-delta.vercel.app","http://localhost:5173"],
    credentials: true,
    methods:['GET','POST','PUT','DELETE']
}
));
app.use(cookieParser());

app.post("/api/v1/signup", async (req, res) => {
    const requiredBody = z.object({
        username: z.string().min(4, "Username too short").max(25, "Username too long"),
        password: z.string().min(6, "Password must be at least 6 characters").max(25, "Password too long")
    })

    const parsedData = requiredBody.safeParse(req.body);
    
    if(!parsedData.success){
        return res.status(400).json({
            msg: "Incorrect format",
            error: parsedData.error
        })
    }
    const {username, password} = parsedData.data;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ error: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            msg: "signed up successfully",
            user
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }

})

app.post("/api/v1/signin", async (req, res) => {
     const {username, password} = req.body;
     if(!username || !password){
       return res.status(500).json({
        msg: "Username and password are required"
       })
     }

     const user = await User.findOne({username});

     if(!user){
       return res.status(401).json({
            msg: "Invaild username"
        })
     }

     const passwordMatch = await bcrypt.compare(password, user.password);

     if(!passwordMatch){
        return res.status(401).json({
            msg: "Invalid password"
        })
     }

     const token = jwt.sign({ id: user.id, username: user.username}, process.env.JWT_SECRET!,{expiresIn: "10d"});

     res.cookie("token", token, {
      httpOnly: true,
      secure: true,        
      sameSite: "none",    
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


     res.status(200).json({
        msg: "Logged in successfully",
     })

})

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
          message: "deleted successfully"
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