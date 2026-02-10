import { generateResumePDF } from "../services/pdf.service.js"

export const generatePDF = async (req, res, next) => {
  try {
    const { previewUrl } = req.body

    if (!previewUrl) {
      return res.status(400).json({ error: "Preview URL required" })
    }

    const pdf = await generateResumePDF(previewUrl)

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=CareerForge-resume.pdf",
      "Content-Length": pdf.length,
    })

    res.send(pdf)
  } catch (err) {
    next(err)
  }
}
