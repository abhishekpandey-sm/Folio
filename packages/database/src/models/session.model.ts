import mongoose, {Schema} from "mongoose";

const sessionSchema = new Schema({
   userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revokedAt: {
        type: Date,
        default: null
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    },
    userAgent: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})


sessionSchema.index({ userId: 1 })

sessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0})

export const Session = mongoose.model("Session", sessionSchema)