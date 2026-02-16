import Usage from "../models/Usage.model.js"

const PLAN_LIMITS = {
  free: 5,
  pro: 50,
  ultimate: Infinity,
}

export const aiRateLimiter = async (req, res, next) => {
  const user = req.user
  const limit = PLAN_LIMITS[user.plan || "free"]

  let usage = await Usage.findOne({ userId: user._id })

  // Create usage doc if missing
  if (!usage) {
    usage = await Usage.create({ userId: user._id })
  }

  // Reset daily usage
  const now = new Date()
  const last = new Date(usage.lastReset)

  if (now.toDateString() !== last.toDateString()) {
    usage.aiCallsToday = 0
    usage.lastReset = now
  }

  if (usage.aiCallsToday >= limit) {
    return res.status(429).json({
      error: "AI limit reached for today",
      plan: user.plan,
      limit,
    })
  }

  // Increment + save
  usage.aiCallsToday += 1
  await usage.save()

  next()
}
