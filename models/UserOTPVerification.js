import mongoose, { Schema } from "mongoose";

const UserOTPVerificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
})

const UserOTPVerification = mongoose.model("UserOTPVerification", UserOTPVerificationSchema);

export default UserOTPVerification;