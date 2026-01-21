import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/secondbrain`);
        console.log("connected");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
        process.exit(1);
    }
}

export default connectDB;