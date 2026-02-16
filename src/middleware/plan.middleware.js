

const PLAN_HIERARCHY = {
  free: 0,
  pro: 1,
  ultimate: 2,
}


export const requirePaidPlan = (requiredPlan = "pro") => {
  return (req, res, next) => {
    try {
      const userPlan = req.user?.plan || "free"

      // Unknown plan protection
      if (!(userPlan in PLAN_HIERARCHY)) {
        return res.status(403).json({
          upgrade: true,
          error: "Invalid subscription plan",
          currentPlan: userPlan,
          requiredPlan,
        })
      }

      if (PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[requiredPlan]) {
        return res.status(403).json({
          upgrade: true, // 🔑 frontend upgrade modal trigger
          error: "Upgrade required",
          currentPlan: userPlan,
          requiredPlan,
        })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

export const requirePro = requirePaidPlan("pro")
