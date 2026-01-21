import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password:{
        type: String,
        required: true
    },
    shareLink: {
        type: String,
        default: null
    },
    shareLinkExpiresAt: {
        type: Date,
        default: null
    }
});


export const User = mongoose.model("User", userSchema)