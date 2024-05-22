import { Schema } from "mongoose";
import mongoose from "mongoose";

const UserSchema = new Schema({
    name: String,
    email: String,
    imageUrl: String,
    password: String,
    phoneNo: String,
    contact: String,
    total_owed: Number,
    groups: [{
        type: Schema.Types.ObjectId,
        ref: "Group",
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction",
    }],
    balanceByGroup: [{
        group_id: {
            type: Schema.Types.ObjectId,
            ref: "Group",
        },
        balance: Number,
    }],
    isVerified: Boolean,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
},{
    timestamps: true,
})

const User = mongoose.model.users || mongoose.model("users", UserSchema);
export default User;