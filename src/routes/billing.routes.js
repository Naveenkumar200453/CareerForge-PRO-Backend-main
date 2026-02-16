import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import {
  createCheckout,
  handleStripeWebhook,
  createPortalSession,
} from "../controllers/billing.controller.js"

const router = express.Router()

/* =========================
   STRIPE CHECKOUT
========================= */
router.post("/checkout", authMiddleware, createCheckout)

/* =========================
   STRIPE CUSTOMER PORTAL
========================= */
router.post("/portal", authMiddleware, createPortalSession)

/* =========================
   STRIPE WEBHOOK
   (raw body handled in app.js)
========================= */
router.post("/webhook", handleStripeWebhook)

export default router
