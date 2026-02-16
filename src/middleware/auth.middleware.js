import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

/* =========================
   AUTH MIDDLEWARE (JWT + DB)
========================= */

// 👑 HARD-CODED SUPER ADMINS (immutable authority)
const SUPER_ADMINS = [
  "careerforgepro5@gmail.com",
  "admin@careerforge.pro",
]

const authMiddleware = async (req, res, next) => {
  try {
    /* =========================
       TOKEN EXTRACTION
    ========================= */
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      })
    }

    const token = authHeader.split(" ")[1]

    /* =========================
       JWT VERIFICATION
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { userId, iat, exp }

    /* =========================
       FETCH USER (DB = SOURCE OF TRUTH)
    ========================= */
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      })
    }

    /* =========================
       SUPER ADMIN ENFORCEMENT
       (self-healing, idempotent)
    ========================= */
    const isSuperAdminEmail = SUPER_ADMINS.includes(user.email)

    if (isSuperAdminEmail) {
      // Ensure DB consistency for super admins
      if (user.role !== "admin" || user.adminLevel !== "super") {
        user.role = "admin"
        user.adminLevel = "super"
        await user.save()
      }
    }

    /* =========================
       REQUEST CONTEXT
       (used everywhere downstream)
    ========================= */
    req.user = {
      _id: user._id,
      userId: user._id,

      email: user.email,
      name: user.name,

      // 🔐 Role system
      role: user.role || "user",
      adminLevel: user.adminLevel || null,

      // 👑 Explicit flags (VERY IMPORTANT)
      isAdmin: user.role === "admin",
      isSuperAdmin:
        user.role === "admin" && user.adminLevel === "super",

      // 💳 Subscription
      plan: user.plan || "free",
      stripeCustomerId: user.stripeCustomerId || null,

      // 🕒 Meta
      createdAt: user.createdAt,
    }

    next()
  } catch (err) {
    console.error("Auth error:", err.message)
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}

export default authMiddleware
