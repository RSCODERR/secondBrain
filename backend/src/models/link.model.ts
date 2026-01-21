import  {model, Schema, Types} from "mongoose";

const linkSchema = new Schema({
    hash:{
        type: String,
        required: true
    },
    userID:{
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
});


export const Link = model("Link", linkSchema);
