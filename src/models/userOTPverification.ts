import mongoose, { Schema } from "mongoose";

const UserOTPVerificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date
})


export default mongoose.model("UserOTPVerification", UserOTPVerificationSchema);