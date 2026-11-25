import mongoose, {Schema} from "mongoose";

const authAccountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    provider: {
        type: String,
        enum: ["google", "email"],
        required: true
    },
    providerAccountId: {
        type: String,
        required: true,
        trim: true
    },
    passwordHash: {
        type: String,
        select: false
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true
})

authAccountSchema.index(
    {provider: 1, providerAccountId: 1},
    {unique: true}
)

export const AuthAccount = mongoose.model("AuthAccount", authAccountSchema)