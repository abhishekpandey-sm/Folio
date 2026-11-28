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

const pageSchema = new Schema({
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    position: {
        type: Number,
        required: true,
        min: 0
    },
    content: {
        type: [contentBlockSchema],
        default: []
    }
}, {
    timestamps: true
})

pageSchema.index({chapterId: 1, position: 1}, {unique: true})

export const Page = mongoose.model("Page", pageSchema)