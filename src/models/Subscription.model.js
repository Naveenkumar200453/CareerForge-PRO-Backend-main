import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    stripeCustomerId: String,
    stripeSubscriptionId: String,

    plan: {
      type: String,
      enum: ["free", "pro", "ultimate"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },

    currentPeriodEnd: Date,
  },
  { timestamps: true }
)

const Subscription = mongoose.model("Subscription", subscriptionSchema)

export default Subscription
