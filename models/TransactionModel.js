import { Schema } from "mongoose";
import mongoose from "mongoose";

const splitbwSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    amount: Number,
},{_id: false})

const TransactionSchema = new Schema({
    description: String,
    amount: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "Group",
    },
    type: {
        type: String,
        enum: ["equally","percentage","custom","shares"],
        default: "equally"
    },
    currencyType: {
        type: String,
        enum: ["INR","USD","EUR","GBP"],
        default: "INR"
    },
    splitbw: [splitbwSchema]
},{
    timestamps: true,
})

const Transaction = mongoose.model.transactions || mongoose.model("transactions", TransactionSchema);
export default Transaction;