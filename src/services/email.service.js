import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"CareerForge Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your CareerForge OTP",
    html: `
      <div style="font-family:Arial">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  })
}
