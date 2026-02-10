import express from "express"
import { scoreResume } from "../controllers/ats.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"


const router = express.Router()

router.use(authMiddleware)

router.post("/score", scoreResume)

export default router
