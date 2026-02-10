import nodemailer from "nodemailer"

export const sendInviteEmail = async ({ to, inviteLink }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"CareerForge Pro" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: "Admin Invitation – CareerForge Pro",
    html: `
      <h2>You are invited as an Admin</h2>
      <p>This invite expires in 24 hours.</p>
      <a href="${inviteLink}">Accept Admin Invite</a>
    `,
  })
}
