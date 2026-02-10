import mongoose from "mongoose"

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "Untitled Resume",
      trim: true,
    },

    content: {
      type: Object,
      required: true,
    },

    template: {
      type: String,
      enum: ["classic", "modern"],
      default: "classic",
    },

    atsScore: {
      type: Number,
      default: null,
    },

    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model("Resume", resumeSchema)
