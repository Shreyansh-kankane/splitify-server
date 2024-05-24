import { Schema } from "mongoose";
import mongoose from "mongoose";



const GroupSchema = new Schema({
    name: String,
    imageUrl: String,
    users: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
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
    },{
    timestamps: true,
})



const Group = mongoose.model.groups || mongoose.model("groups", GroupSchema);
export default Group;