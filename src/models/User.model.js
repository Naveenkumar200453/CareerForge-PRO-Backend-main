import mongoose from "mongoose"


/* =========================
   CONSTANTS
========================= */
const SUPERADMIN_EMAILS = [
  "careerforgepro5@gmail.com",
  "admin@careerforge.pro",
]

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema(
  {
    /* ======================
       AUTH CORE
    ====================== */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: true,
    },

    name: {
      type: String,
      trim: true,
    },

    /* ======================
       ROLE & ADMIN CONTROL
    ====================== */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    /**
     * adminLevel
     *  - super  → system owners (fixed emails)
     *  - normal → invited admins
     *  - null   → regular users
     */
    adminLevel: {
      type: String,
      enum: ["super", "normal"],
      default: null,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ======================
       ADMIN INVITE SYSTEM
    ====================== */
    adminInvite: {
      token: { type: String },
      expiresAt: { type: Date },
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    /* ======================
       AVATAR
    ====================== */
    avatarUrl: {
      type: String,
      default: "",
    },

    /* ======================
       OTP VERIFICATION
    ====================== */
    otpHash: String,
    otpExpiry: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },

    /* ======================
       SUBSCRIPTION / PLAN
    ====================== */
    plan: {
      type: String,
      enum: ["free", "pro", "ultimate"],
      default: "free",
    },

    // 🔁 Backward compatibility
    subscription: {
      type: String,
      enum: ["free", "pro", "ultimate"],
      default: "free",
    },

    /* ======================
       STRIPE
    ====================== */
    stripeCustomerId: String,

    /* ======================
       USAGE ANALYTICS
    ====================== */
    usage: {
      resumesGenerated: { type: Number, default: 0 },
      atsScans: { type: Number, default: 0 },
      aiCreditsUsed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
)

/* =========================
   SUPERADMIN ENFORCEMENT
========================= */
import bcrypt from "bcryptjs"

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})


/* =========================
   MODEL EXPORT
========================= */
const User = mongoose.model("User", userSchema)
export default User
