import { Schema } from "mongoose";
import mongoose from "mongoose";

const GroupSchema = new Schema({
    name: String,
    imageUrl: String,
    balancePerUser: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        balance: Number,
    }],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction",
    }],
},{
    timestamps: true,
})

const Group = mongoose.model.groups || mongoose.model("groups", GroupSchema);
export default Group;