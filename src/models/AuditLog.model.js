import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    target: {
      type: String, // email / userId / entity id
      required: true,
    },

    ip: String,
    userAgent: String,

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
)

export default mongoose.model("AuditLog", auditLogSchema)
