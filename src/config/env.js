import dotenv from "dotenv"

dotenv.config()

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  CLIENT_URL: process.env.CLIENT_URL,
}
