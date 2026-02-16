import { generateAI } from "../services/ai.service.js"
import {
  extractKeywordsPrompt,
  rewriteBulletPrompt,
  rewriteSummaryPrompt,
} from "../services/ai.prompts.js"

/* =========================
   REWRITE WITH AI
========================= */
export const rewriteWithAI = async (req, res, next) => {
  try {
    const {
      jd,
      type, // "bullet" | "summary"
      content,
      role,
    } = req.body

    if (!jd || !type || !content || !role) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // 1️⃣ Extract keywords from JD
    const keywordsText = await generateAI(
      extractKeywordsPrompt(jd)
    )

    // Clean keywords
    const keywords = keywordsText
      .replace(/\n/g, "")
      .trim()

    let rewritten

    // 2️⃣ Rewrite based on type
    if (type === "bullet") {
      rewritten = await generateAI(
        rewriteBulletPrompt({
          bullet: content,
          keywords,
          role,
        })
      )
    }

    if (type === "summary") {
      rewritten = await generateAI(
        rewriteSummaryPrompt({
          summary: content,
          keywords,
          role,
        })
      )
    }

    res.json({
      success: true,
      rewritten: rewritten.trim(),
      keywords,
    })
  } catch (err) {
    next(err)
  }
}
