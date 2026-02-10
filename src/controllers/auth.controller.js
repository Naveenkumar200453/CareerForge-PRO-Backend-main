import User from "../models/User.model.js"
import { generateOTP, hashOTP, verifyOTP } from "../services/otp.service.js"
import { sendMail } from "../config/mail.js"
import { signToken } from "../utils/jwt.js"
import bcrypt from "bcryptjs"

/* =========================
   SEND / RESEND OTP
========================= */
export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email is required" })

    const otp = generateOTP()
    const otpHash = hashOTP(otp)

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        email,
        isVerified: false,
        plan: "free",
      })
    }

    user.otpHash = otpHash
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendMail({
      to: email,
      subject: "CareerForge Pro OTP",
      html: `<h2>Your One time password is </h2><h1>${otp}</h1>`,
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/* =========================
   VERIFY OTP (EMAIL ONLY)
========================= */
export const verifyOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.otpHash) {
      return res.status(400).json({ error: "Invalid or expired OTP" })
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP expired" })
    }

    const valid = verifyOTP(otp, user.otpHash)
    if (!valid) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    user.isVerified = true
    user.otpHash = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/* =========================
   COMPLETE SIGNUP
========================= */
export const completeSignup = async (req, res, next) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({
        error: "Name and password required to complete signup",
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Email not verified",
      })
    }

    // ✅ IMPORTANT FIX
    if (user.password) {
      return res.status(400).json({
        error: "Account already completed. Please log in.",
      })
    }

    user.name = name
    user.password = await bcrypt.hash(password, 12)
    await user.save()

    const token = signToken({ userId: user._id })

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan || "free",
      },
    })
  } catch (err) {
    next(err)
  }
}

/* =========================
   GET CURRENT USER
========================= */
export const getMe = async (req, res, next) => {
  try {
    // ✅ FIX: use _id injected by authMiddleware
    const user = await User.findById(req.user._id).select(
      "_id name email plan subscription isVerified"
    )

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan || user.subscription || "free",
      isVerified: user.isVerified,
    })
  } catch (err) {
    next(err)
  }
}

/* =========================
   LOGIN
========================= */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
  return res.status(400).json({
    error: "Invalid email or password",
  })
}

if (!user.password) {
  return res.status(400).json({
    error: "Account not completed. Please finish signup.",
  })
}

if (!user.isVerified) {
  return res.status(403).json({
    error: "Please verify your email first",
  })
}


    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      })
    }

    const token = signToken({ userId: user._id })

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan || "free"

      },
    })
  } catch (err) {
    next(err)
  }
}



export const updateProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body
    const userId = req.user._id || req.user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (name) {
      user.name = name
    }

    if (password) {
      const salt = await bcrypt.genSalt(12)
      user.password = await bcrypt.hash(password, salt)
    }

    await user.save()

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatarUrl: user.avatarUrl,
    })
  } catch (err) {
    next(err)
  }
}



/* =========================
   UPDATE AVATAR (FILE UPLOAD)
========================= */
export const updateAvatar = async (req, res) => {
  try {
    // 🔴 multer puts file here
    if (!req.file) {
      return res.status(400).json({ error: "Avatar file missing" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // ✅ public URL for frontend
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    user.avatarUrl = avatarUrl
    await user.save()

    res.json({
      success: true,
      avatarUrl,
    })
  } catch (err) {
    console.error("Avatar upload error:", err)
    res.status(500).json({ error: "Avatar upload failed" })
  }
}
