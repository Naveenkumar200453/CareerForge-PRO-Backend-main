import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import { requirePaidPlan } from "../middleware/plan.middleware.js"
import { generatePDF } from "../controllers/pdf.controller.js"

const router = express.Router()

router.post(
  "/generate",
  authMiddleware,
  requirePaidPlan,
  generatePDF
)

export default router
