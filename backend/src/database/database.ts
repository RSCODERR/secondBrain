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
        await mongoose.connect(finalUri);
        console.log("connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
        process.exit(1);
    }
}

export default connectDB;