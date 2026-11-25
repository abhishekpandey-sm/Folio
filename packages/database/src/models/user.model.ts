import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatarURL: {
        type: String,
        default: ""
    }
},{
    timestamps: true
})

export const User = mongoose.model("User", userSchema)