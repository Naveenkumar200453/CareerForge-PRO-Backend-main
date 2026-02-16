import Resume from "../models/Resume.model.js"
import { generateResumePDF } from "../services/pdf.service.js"

/* =========================
   CREATE RESUME
========================= */
export const createResume = async (req, res, next) => {
  try {
    const resume = await Resume.create({
      userId: req.user.id,
      title: req.body.title || "Untitled Resume",
      content: req.body.content || {},
      template: req.body.template || "classic",
    })

    res.status(201).json(resume)
  } catch (err) {
    next(err)
  }
}

/* =========================
   GET ALL USER RESUMES
========================= */
export const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({
      userId: req.user.id,
    })
      .sort({ updatedAt: -1 })
      .select("-content") // lightweight list

    res.json(resumes)
  } catch (err) {
    next(err)
  }
}

/* =========================
   GET SINGLE RESUME
========================= */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    res.json(resume)
  } catch (err) {
    next(err)
  }
}

/* =========================
   UPDATE RESUME (AUTOSAVE)
========================= */
export const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        $set: {
          content: req.body.content,
          template: req.body.template,
          title: req.body.title,
          lastEditedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    res.json(resume)
  } catch (err) {
    next(err)
  }
}

/* =========================
   DELETE RESUME
========================= */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/* =========================
   DOWNLOAD PDF (PRO ONLY)
========================= */
export const generatePDF = async (req, res, next) => {
  try {
    const resumeId = req.params.id

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Secure server-side render URL
    const previewUrl = `${process.env.CLIENT_URL}/resume/${resumeId}/print`

    const pdf = await generateResumePDF({ url: previewUrl })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resume.title}.pdf"`
    )

    res.send(pdf)
  } catch (err) {
    next(err)
  }
}
