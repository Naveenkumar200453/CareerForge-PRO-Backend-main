import stripe from "../services/stripe.service.js"
import Subscription from "../models/Subscription.model.js"
import User from "../models/User.model.js"

/* =========================
   CREATE CHECKOUT SESSION
========================= */
export const createCheckout = async (req, res, next) => {
  try {
    const { priceId } = req.body
    const user = req.user

    if (!priceId) {
      return res.status(400).json({ error: "Price ID required" })
    }

    // 🛑 Prevent duplicate active subscription
    if (user.plan !== "free") {
      return res.status(400).json({
        error: "You already have an active subscription",
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: user._id.toString(),
        priceId, // 🔑 used in webhook
      },
      success_url: `${process.env.CLIENT_URL}/account`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    })

    res.json({ url: session.url })
  } catch (err) {
    next(err)
  }
}

/* =========================
   STRIPE WEBHOOK HANDLER
========================= */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // ⚠ raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    /* =========================
       SUBSCRIPTION CREATED
    ========================= */
    case "checkout.session.completed": {
      const session = event.data.object
      const { userId, priceId } = session.metadata

      // ✅ MAP REAL STRIPE PRICE IDs
      const planMap = {
        [process.env.STRIPE_PRO_PRICE_ID]: "pro",
        [process.env.STRIPE_ULTIMATE_PRICE_ID]: "ultimate",
      }

      const plan = planMap[priceId] || "pro"

      // 🔄 Update user
      await User.findByIdAndUpdate(userId, {
        plan,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      })

      // 🔄 Subscription record (idempotent)
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: session.subscription },
        {
          userId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          plan,
          status: "active",
        },
        { upsert: true }
      )

      console.log("✅ Subscription activated for user:", userId)
      break
    }

    /* =========================
       SUBSCRIPTION CANCELED
    ========================= */
    case "customer.subscription.deleted": {
      const sub = event.data.object

      await User.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { plan: "free", stripeSubscriptionId: null }
      )

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { status: "canceled" }
      )

      console.log("⚠️ Subscription canceled:", sub.id)
      break
    }
  }

  res.json({ received: true })
}

/* =========================
   STRIPE CUSTOMER PORTAL
========================= */
export const createPortalSession = async (req, res) => {
  const user = req.user

  if (!user.stripeCustomerId) {
    return res.status(400).json({
      error: "No Stripe customer found",
    })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/account`,
  })

  res.json({ url: session.url })
}
