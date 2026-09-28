import { Schema, Types, model } from "mongoose";
import "./tag.model";

const contentTypes = ["link", "note", "youtube", "twitter"];

const contentSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: contentTypes,
    required: true
  },

  link: {
    type: String,
    trim: true,
    default: null
  },

  note: {
    type: String,
    default: null
  },

  tags: [{
    type: Types.ObjectId,
    ref: "tag"
  }],

  pinned: {
    type: Boolean,
    default: false
  },

  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  }
});

export const content = model("content", contentSchema);
