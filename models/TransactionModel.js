import { Schema } from "mongoose";

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
        enum: ["equally","custom"],
        default: "equally"
    },
    currencyType: {
        type: String,
        enum: ["INR","USD","EUR","GBP"],
        default: "INR"
    },
    splitbw: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        amount: Number,
    }]
},{
    timestamps: true,
})

const Transaction = mongoose.model.transactions || mongoose.model("transactions", TransactionSchema);
export default Transaction;