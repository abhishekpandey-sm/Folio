import mongoose, { Schema } from "mongoose";

const verificationModelSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    purpose: {
        type: String,
        enum: [ "email_verification", "password_reset"],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    usedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true
})

verificationModelSchema.index(
    {expiresAt: 1},
    {expireAfterSeconds: 0}
)

export const VerificationToken = mongoose.model("VerificationToken", verificationModelSchema)