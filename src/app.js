import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import path from "path"

import authRoutes from "./routes/auth.routes.js"
import resumeRoutes from "./routes/resume.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import atsRoutes from "./routes/ats.routes.js"
import billingRoutes from "./routes/billing.routes.js"
import pdfRoutes from "./routes/pdf.routes.js"
import adminRoutes from "./routes/admin.routes.js"


import { handleStripeWebhook } from "./controllers/billing.controller.js"
import errorMiddleware from "./middleware/error.middleware.js"

const app = express()

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

/* =========================
   STRIPE WEBHOOK (RAW BODY)
   ⚠ MUST COME BEFORE express.json()
========================= */
app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
)

/* =========================
   NORMAL JSON PARSER
========================= */
app.use(express.json())


app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
)



/* =========================
   ROUTES
========================= */
app.use("/auth", authRoutes)
app.use("/resumes", resumeRoutes)
app.use("/ai", aiRoutes)
app.use("/ats", atsRoutes)
app.use("/billing", billingRoutes)
app.use("/pdf", pdfRoutes)
app.use("/admin", adminRoutes)




/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "CareerForge Pro API",
    timestamp: new Date().toISOString(),
  })
})

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use(errorMiddleware)

export default app
