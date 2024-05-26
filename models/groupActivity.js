import mongoose, {Schema} from "mongoose";

const GroupActivitySchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    activityId: {
        type: Schema.Types.ObjectId,
        ref: 'Activity',
        required: true
    },
},{
    timestamps: true
})

const GroupActivity = mongoose.model('GroupActivity', GroupActivitySchema);
export default GroupActivity;