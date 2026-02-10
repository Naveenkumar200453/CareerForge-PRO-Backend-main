import multer from "multer"
import path from "path"
import fs from "fs"

/* =========================
   STORAGE
========================= */
const uploadDir = "uploads/avatars"

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir)
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${Date.now()}${ext}`)
  },
})

/* =========================
   FILE FILTER
========================= */
const fileFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only images allowed"), false)
  } else {
    cb(null, true)
  }
}

/* =========================
   EXPORT (IMPORTANT)
========================= */
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})
