import mongoose, {Schema} from "mongoose";

const contentBlockSchema = new Schema({
    type: {
        type: String,
        enum:[
            "heading",
            "paragraph",
            "image",
            "code",
            "list",
            "table"
        ],

        required: true
    },

    data: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: false
})

const pageSchma = new Schema({
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    position: {
        type: Number,
        required: true,
        min: 1
    },
    content: {
        type: [contentBlockSchema],
        default: []
    }
}, {
    timestamps: true
})

pageSchma.index({chapterId: 1, position: 1}, {unique: true})

export const Page = mongoose.model("Page", pageSchma)