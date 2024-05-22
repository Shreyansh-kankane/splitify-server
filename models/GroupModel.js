import { Schema } from "mongoose";
import mongoose from "mongoose";

const balancePerUserSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    balance: { type: Number, default: 0 }
}, { _id: false });


const GroupSchema = new Schema({
    name: String,
    imageUrl: String,
    balancePerUser: [ balancePerUserSchema ],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction",
    }],
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 
    currencyType: {
        type: String,
        enum: ["INR", "USD", "EUR", "GBP"],
        default: "INR"
    },
    type: {
        type: String,
        enum: ["Trip", "House", "Friend", "Other"],
        default: "Other"
    },
    // pending Invites
    },{
    timestamps: true,
})



const Group = mongoose.model.groups || mongoose.model("groups", GroupSchema);
export default Group;