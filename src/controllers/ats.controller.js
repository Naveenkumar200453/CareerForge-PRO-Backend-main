import { calculateATSScore } from "../services/ats.service.js"

/* =========================
   ATS SCORE ENDPOINT
========================= */
export const scoreResume = async (req, res, next) => {
  try {
    const { jd, resume } = req.body

    if (!jd || !resume) {
      return res
        .status(400)
        .json({ message: "JD and resume are required" })
    }

    const result = calculateATSScore({ jd, resume })

    res.json({
      success: true,
      ...result,
    })
  } catch (err) {
    next(err)
  }
}
