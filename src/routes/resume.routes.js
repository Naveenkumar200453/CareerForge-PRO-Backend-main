import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import { requirePaidPlan } from "../middleware/plan.middleware.js"
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  generatePDF,
} from "../controllers/resume.controller.js"

const router = express.Router()

router.use(authMiddleware)

router.post("/", createResume)
router.get("/", getUserResumes)
router.get("/:id", getResumeById)
router.put("/:id", updateResume)
router.delete("/:id", deleteResume)

/* 🔒 PRO FEATURE */
router.get("/:id/pdf", requirePaidPlan("pro"), generatePDF)

export default router
