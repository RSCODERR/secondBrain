import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "";
        let finalUri = uri;
        if (uri.includes("?")) {
            const [base, query] = uri.split("?");
            const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
            finalUri = cleanBase.endsWith("/secondbrain") ? `${cleanBase}?${query}` : `${cleanBase}/secondbrain?${query}`;
        } else {
            const cleanBase = uri.endsWith("/") ? uri.slice(0, -1) : uri;
            finalUri = cleanBase.endsWith("/secondbrain") ? cleanBase : `${cleanBase}/secondbrain`;
        }
        await mongoose.connect(finalUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        console.log("connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
        process.exit(1);
    }
}

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected. Mongoose will attempt to reconnect automatically.");
});

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

export default connectDB;