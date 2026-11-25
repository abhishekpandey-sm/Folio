import mongoose, {Schema} from "mongoose";

const chapterSchema = new Schema({
    notebookId: {
        type: Schema.Types.ObjectId,
        ref: "Notebook",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        default: "",
        maxlength: 500
    },
    position: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
})

chapterSchema.index({notebookId: 1, position: 1},
    {unique: true}
)

export const Chapter = mongoose.model("Chapter", chapterSchema)