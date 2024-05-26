import mongoose,{Schema} from "mongoose";

const ActivitySchema = new Schema({
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paidBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paidFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    settled: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;