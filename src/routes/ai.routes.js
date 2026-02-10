import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import { aiRateLimiter } from "../middleware/rateLimit.middleware.js"
import { rewriteWithAI } from "../controllers/ai.controller.js"
import { requirePaidPlan } from "../middleware/plan.middleware.js"

const router = express.Router()

/* =========================
   AI REWRITE (AUTH + PLAN + RATE LIMITED)
========================= */
router.post(
  "/rewrite",
  authMiddleware,               // 🔐 must be logged in
  requirePaidPlan("pro"),       // 💳 must be PRO or higher
  aiRateLimiter,                // ⏱ plan-based quota
  rewriteWithAI                 // 🤖 controller LAST
)

export default router
