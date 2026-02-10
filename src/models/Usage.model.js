import mongoose from "mongoose"

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    aiCallsToday: {
      type: Number,
      default: 0,
    },

    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const Usage = mongoose.model("Usage", usageSchema)
export default Usage
