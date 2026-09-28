import mongoose, { Schema } from "mongoose";

const tagSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  }
});

export const tag = mongoose.models.tag || mongoose.model("tag", tagSchema);
export const Tag = tag;