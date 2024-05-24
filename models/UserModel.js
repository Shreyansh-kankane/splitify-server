import { Schema } from "mongoose";
import mongoose from "mongoose";

const userGroupSchema = new Schema({
    group_id: {
        type: Schema.Types.ObjectId,
        ref: "Group",
    },
    balance: Number,
}, {_id: false})

const userFriendSchema = new Schema({
    friend_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    balance: Number,
}, {_id: false})

const UserSchema = new Schema({
    name: String,
    email: String,
    imageUrl: String,
    password: String,
    phoneNo: String,
    contact: String,
    total_owed: Number,
    friends: [ userFriendSchema ],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction",
    }],
    groups: [ userGroupSchema ],
    isVerified: Boolean,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
},{
    timestamps: true,
})

const User = mongoose.model.users || mongoose.model("users", UserSchema);
export default User;