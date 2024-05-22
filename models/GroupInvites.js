import { Schema } from "mongoose";
import mongoose from "mongoose";

const GroupInviteSchema = new Schema({
    inviteEmail: String,
    expirationTime: Date,
    
},{
    timestamps: true,
})