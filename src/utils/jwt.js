import jwt from "jsonwebtoken"

const JWT_EXPIRES_IN = "7d"

/* =========================
   SIGN TOKEN
========================= */
export const signToken = (payload) => {
  const JWT_SECRET = process.env.JWT_SECRET

  if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is missing. Check your .env file.")
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/* =========================
   VERIFY TOKEN
========================= */
export const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET

  if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is missing. Check your .env file.")
  }

  return jwt.verify(token, JWT_SECRET)
}
