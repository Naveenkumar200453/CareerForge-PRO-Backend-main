/* =========================
   ADMIN ACCESS MIDDLEWARE
========================= */

// Optional bootstrap (used only if DB not yet seeded)
const SUPER_ADMIN_EMAILS = [
  "careerforgepro5@gmail.com",
  "admin@careerforge.pro",
]

const adminAccess = (req, res, next) => {
  /* ======================
     AUTH CHECK
  ====================== */
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    })
  }

  /* ======================
     ROLE CHECK
  ====================== */
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access only",
    })
  }

  /* ======================
     SUPER ADMIN RESOLUTION
  ====================== */
  const isSuperAdmin =
    req.user.adminLevel === "super" ||
    SUPER_ADMIN_EMAILS.includes(req.user.email)

  /* ======================
     UNIFIED ADMIN CONTEXT
  ====================== */
  req.admin = Object.freeze({
    isAdmin: true,
    isSuperAdmin,
    canInviteAdmins: isSuperAdmin,
    canPromoteAdmins: isSuperAdmin,
    canDemoteAdmins: isSuperAdmin,
  })

  next()
}

export default adminAccess
