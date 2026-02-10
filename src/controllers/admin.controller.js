import crypto from "crypto"
import User from "../models/User.model.js"
import AuditLog from "../models/AuditLog.model.js"

/* =========================
   ADMIN ACTION HANDLER
========================= */
export const adminAction = async (req, res) => {
  try {
    const { action, targetUserId, email } = req.body
    const { isSuperAdmin } = req.admin
    const requesterId = req.user._id

    if (!action) {
      return res.status(400).json({ error: "Action is required" })
    }

    /* ======================
       DASHBOARD STATS
    ====================== */
    if (action === "stats") {
      const [
        totalUsers,
        totalAdmins,
        proUsers,
        ultimateUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ plan: "pro" }),
        User.countDocuments({ plan: "ultimate" }),
      ])

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalAdmins,
          proUsers,
          ultimateUsers,
        },
      })
    }

    /* ======================
       USERS TABLE
    ====================== */
    if (action === "users") {
      const users = await User.find()
        .select("-password -otpHash -otpExpiry")

      return res.json({ success: true, users })
    }

    /* ======================
       SUPER ADMIN GATE
    ====================== */
    if (!isSuperAdmin) {
      return res.status(403).json({
        error: "Super admin privileges required",
      })
    }

    /* ======================
       INVITE ADMIN
    ====================== */
    if (action === "invite") {
      if (!email) {
        return res.status(400).json({ error: "Email is required" })
      }

      let user = await User.findOne({ email })

      if (user?.role === "admin") {
        return res.status(400).json({
          error: "User is already an admin",
        })
      }

      const rawToken = crypto.randomBytes(32).toString("hex")
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex")

      if (!user) {
        user = await User.create({ email })
      }

      user.adminInvite = {
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        invitedBy: requesterId,
      }

      await user.save()

      await AuditLog.create({
        actor: requesterId,
        action: "INVITE_ADMIN",
        target: email,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      })

      // TODO: send email
      // `${FRONTEND_URL}/admin/accept?token=${rawToken}`

      return res.json({
        success: true,
        message: `Admin invite sent to ${email}`,
      })
    }

    /* ======================
       PROMOTE USER
    ====================== */
    if (action === "promote") {
      if (!targetUserId) {
        return res.status(400).json({ error: "Target user ID required" })
      }

      const target = await User.findById(targetUserId)

      if (!target) {
        return res.status(404).json({ error: "User not found" })
      }

      if (target.role === "admin") {
        return res.status(400).json({
          error: "User is already an admin",
        })
      }

      target.role = "admin"
      target.adminLevel = "normal"
      await target.save()

      await AuditLog.create({
        actor: requesterId,
        action: "PROMOTE_ADMIN",
        target: targetUserId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      })

      return res.json({
        success: true,
        message: "User promoted to admin",
      })
    }

    /* ======================
       DEMOTE ADMIN
    ====================== */
    if (action === "demote") {
      if (!targetUserId) {
        return res.status(400).json({ error: "Target user ID required" })
      }

      if (targetUserId.toString() === requesterId.toString()) {
        return res.status(400).json({
          error: "You cannot demote yourself",
        })
      }

      const target = await User.findById(targetUserId)

      if (!target) {
        return res.status(404).json({ error: "User not found" })
      }

      if (target.role !== "admin") {
        return res.status(400).json({
          error: "User is not an admin",
        })
      }

      if (target.adminLevel === "super") {
        return res.status(403).json({
          error: "Super admin cannot be demoted",
        })
      }

      target.role = "user"
      target.adminLevel = null
      await target.save()

      await AuditLog.create({
        actor: requesterId,
        action: "DEMOTE_ADMIN",
        target: targetUserId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      })

      return res.json({
        success: true,
        message: "Admin demoted",
      })
    }

    return res.status(400).json({ error: "Invalid admin action" })
  } catch (err) {
    console.error("Admin error:", err)
    return res.status(500).json({ error: "Admin action failed" })
  }
}

/* =========================
   ACCEPT ADMIN INVITE
========================= */
export const acceptAdminInvite = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: "Token required" })
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    const user = await User.findOne({
      "adminInvite.token": hashedToken,
      "adminInvite.expiresAt": { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired invite",
      })
    }

    user.role = "admin"
    user.adminLevel = "normal"
    user.adminInvite = null

    await user.save()

    await AuditLog.create({
      actor: user._id,
      action: "ACCEPT_ADMIN_INVITE",
      target: user.email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    })

    return res.json({
      success: true,
      message: "Admin access granted",
    })
  } catch (err) {
    console.error("Invite accept error:", err)
    return res.status(500).json({
      error: "Failed to accept invite",
    })
  }
}



/* =========================
   GET AUDIT LOGS
========================= */
export const getAuditLogs = async (req, res) => {
  try {
    // Only admins reach here (middleware already guards)
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("actor", "email role adminLevel")

    return res.json({
      success: true,
      logs,
    })
  } catch (err) {
    console.error("Audit logs error:", err)
    return res.status(500).json({
      error: "Failed to fetch audit logs",
    })
  }
}



export const getRevenueStats = async (req, res) => {
  const subscriptions = await stripe.subscriptions.list({
    status: "active",
    limit: 100,
  })

  const monthlyRevenue = subscriptions.data.reduce(
    (sum, s) => sum + (s.plan.amount || 0),
    0
  )

  res.json({
    success: true,
    monthlyRevenue: monthlyRevenue / 100,
    activeSubscriptions: subscriptions.data.length,
  })
}


export const impersonateUser = async (req, res) => {
  if (!req.admin.isSuperAdmin) {
    return res.status(403).json({ error: "Forbidden" })
  }

  const { userId } = req.body
  const user = await User.findById(userId)

  const token = signToken({
    userId: user._id,
    impersonatedBy: req.user._id,
  })

  await AuditLog.create({
    actor: req.user._id,
    action: "IMPERSONATE",
    target: user.email,
  })

  res.json({ token })
}
