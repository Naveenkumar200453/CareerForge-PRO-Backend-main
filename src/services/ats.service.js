/* =========================
   STOPWORDS (CRITICAL)
========================= */
const STOPWORDS = new Set([
  "a","an","the","and","or","but",
  "with","without","in","on","at",
  "to","for","from","by","of",
  "is","are","was","were","be",
  "this","that","these","those",
  "looking","experience","experienced",
  "as","per","role","job","position"
])

/* =========================
   UTILITIES
========================= */
const normalize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(
      word =>
        word.length > 1 &&       // remove 1-letter noise
        !STOPWORDS.has(word)
    )

const unique = (arr) => [...new Set(arr)]

/* =========================
   KEYWORD EXTRACTION
========================= */
export const extractKeywords = (text) => {
  return unique(normalize(text))
}

/* =========================
   ATS SCORE CALCULATION
========================= */
export const calculateATSScore = ({ jd, resume }) => {
  // 1️⃣ JD keywords (ground truth)
  const jdKeywords = extractKeywords(jd)

  // 2️⃣ Resume text aggregation
  const resumeText = `
    ${resume.summary || ""}
    ${(resume.skills || []).join(" ")}
    ${(resume.experience || [])
      .map(e => (e.bullets || []).join(" "))
      .join(" ")}
  `

  const resumeKeywords = extractKeywords(resumeText)

  // 3️⃣ Matching logic
  const matched = jdKeywords.filter(k =>
    resumeKeywords.includes(k)
  )

  const missing = jdKeywords.filter(
    k => !resumeKeywords.includes(k)
  )

  // 4️⃣ Final ATS score
  const score =
    jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100)

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    totalKeywords: jdKeywords.length,
  }
}
