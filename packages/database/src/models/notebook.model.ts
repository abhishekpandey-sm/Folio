import mongoose, {Schema} from "mongoose"

const pageSettingSchema = new Schema({
    size: {
        type: String,
        enum: ["A4", "A5", "letter", "custom"],
        default: "A4",
        required: true
    },
    width: {
        type: Number,
        min: 1
    },
    height: {
        type: Number,
        min: 1
    },
    unit: {
        type: String,
        enum: ["mm", "in"],
        default: "mm"
    }
},
{_id : false}
)

const collaboratorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "viewer",
      required: true
    }
  },
  { _id: false }
);



const notebookSchema = new Schema({
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
    type: {
        type: String,
        enum: ["structured", "scrapbook"],
        default: "structured",
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collaborators: {
        type: [collaboratorSchema],
        default: []
    },
    pageSettings: {
        type: pageSettingSchema,
        default: () => ({})
    },  
},{
    timestamps: true
})

notebookSchema.index({ownerId: 1, updatedAt: -1})

export const Notebook = mongoose.model("Notebook", notebookSchema)
