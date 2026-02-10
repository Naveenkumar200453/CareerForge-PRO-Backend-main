import crypto from "crypto"

export const generateInviteToken = () => {
  return crypto.randomBytes(32).toString("hex")
}
