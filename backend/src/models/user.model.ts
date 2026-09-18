import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationExpiresAt: {
        type: Date,
        default: null
    },
    resetPasswordCode: {
        type: String,
        default: null
    },
    resetPasswordExpiresAt: {
        type: Date,
        default: null
    },
    shareLink: {
        type: String,
        default: null
    },
    shareLinkExpiresAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });


export const User = mongoose.model("User", userSchema)