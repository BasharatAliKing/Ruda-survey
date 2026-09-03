import multer from "multer";
import path from "path";
import fs from "fs";


/* ================= Survey PHOTOS ================= */
const surveyPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/images");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // ✅ FIXED (removed 8)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      "survey-" + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

export const surveyPhotoUpload = multer({
  storage: surveyPhotoStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
