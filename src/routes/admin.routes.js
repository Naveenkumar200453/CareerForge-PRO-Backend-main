import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import adminAccess from "../middleware/admin.middleware.js"
import {
  adminAction,
  acceptAdminInvite,
  getAuditLogs,
  getRevenueStats,
} from "../controllers/admin.controller.js"

const router = express.Router()

/* =========================
   REST-STYLE ADMIN ROUTES
========================= */

// 📊 Dashboard stats
router.get(
  "/stats",
  authMiddleware,
  adminAccess,
  (req, res) =>
    adminAction(
      {
        ...req,
        body: { action: "stats" },
      },
      res
    )
)

// 👥 Users table
router.get(
  "/users",
  authMiddleware,
  adminAccess,
  (req, res) =>
    adminAction(
      {
        ...req,
        body: { action: "users" },
      },
      res
    )
)

// 🧾 Audit logs
router.get(
  "/audit",
  authMiddleware,
  adminAccess,
  getAuditLogs
)

// 💰 Revenue stats (Stripe)
router.get(
  "/revenue",
  authMiddleware,
  adminAccess,
  getRevenueStats
)

// 🔁 Unified action endpoint
// promote | demote | invite
router.post(
  "/",
  authMiddleware,
  adminAccess,
  adminAction
)

// ✉️ Accept admin invite
router.post(
  "/accept-invite",
  authMiddleware,
  acceptAdminInvite
)

export default router
