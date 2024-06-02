import { Schema } from "mongoose";
import mongoose from "mongoose";

const FriendInvites = new Schema({
    inviteEmail: String,
    expirationTime: Date,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
})  

export default mongoose.model.friendInvites || mongoose.model("friendInvites", FriendInvites);