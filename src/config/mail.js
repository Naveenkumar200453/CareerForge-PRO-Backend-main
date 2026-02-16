import nodemailer from "nodemailer"

/* =========================
   ENV SAFE LOAD
========================= */
const EMAIL_USER = process.env.EMAIL_USER?.trim()
const EMAIL_PASS = process.env.EMAIL_PASS?.trim()

/* =========================
   ENV CHECK (NON-FATAL)
========================= */
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠ EMAIL credentials missing. Email features disabled.")
}

/* =========================
   TRANSPORTER (LAZY + SAFE)
========================= */
let mailTransporter = null

if (EMAIL_USER && EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

/* =========================
   SEND MAIL HELPER
========================= */
export const sendMail = async ({ to, subject, html }) => {
  if (!mailTransporter) {
    console.warn(`📭 Email skipped → ${to} | ${subject}`)
    return { skipped: true }
  }

  try {
    return await mailTransporter.sendMail({
      from: `"CareerForge Pro" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("❌ Email send failed:", error.message)
    return { error: true }
  }
}

export default mailTransporter
