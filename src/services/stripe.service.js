import Stripe from "stripe"

let stripe = null

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠ Stripe disabled: STRIPE_SECRET_KEY not set")
} else {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
}

export const createCheckoutSession = async (data) => {
  if (!stripe) throw new Error("Stripe not configured")
  return stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: data.email,
    line_items: [{ price: data.priceId, quantity: 1 }],
    metadata: { userId: data.userId },
    success_url: `${process.env.CLIENT_URL}/billing/success`,
    cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
  })
}

export default stripe
