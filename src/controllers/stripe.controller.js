import Stripe from "stripe"
import User from "../models/User.model.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"]

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object

        await User.findOneAndUpdate(
          { email: session.customer_email },
          {
            stripeCustomerId: session.customer,
            subscriptionStatus: "active",
            plan: "pro",
          }
        )

        console.log("✅ Subscription activated")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object

        await User.findOneAndUpdate(
          { stripeCustomerId: subscription.customer },
          { plan: "free", subscriptionStatus: "cancelled" }
        )

        console.log("❌ Subscription cancelled")
        break
      }

      case "invoice.payment_failed":
        console.warn("⚠️ Payment failed")
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (err) {
    console.error("🔥 Webhook processing error:", err)
    res.status(500).json({ error: "Webhook handler failed" })
  }
}
