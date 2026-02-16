import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"

import {
  sendOTP,
  verifyOTPController,
  completeSignup,
  login,
  getMe,
  updateProfile,
  updateAvatar,
} from "../controllers/auth.controller.js"
import { uploadAvatar } from "../middleware/uploadAvatar.middleware.js"




const router = express.Router()

/* =========================
   AUTH / OTP FLOW
========================= */
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTPController)
router.post("/complete-signup", completeSignup)

/* =========================
   AUTH / LOGIN
========================= */
router.post("/login", login)

/* =========================
   AUTH / CURRENT USER
========================= */
router.get("/me", authMiddleware, getMe)

/* =========================
   AUTH / PROFILE
========================= */
router.patch("/update-profile", authMiddleware, updateProfile)





router.patch(
  "/update-avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  updateAvatar
)



export default router
