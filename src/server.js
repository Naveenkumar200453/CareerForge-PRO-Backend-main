import "./config/env.js"   // 👈 MUST be first

import app from "./app.js"
import connectDB from "./config/db.js"

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`)
    console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`)
  })
})
