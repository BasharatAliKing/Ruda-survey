import express from "express";
import multer from "multer";
import path from "path";
import {
  importSurveysFromExcel,
  createSurvey,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
  getSurveyById,
  getSurveyBySrNo,
} from "../controllers/surveyController.js";

const route = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ======================================================
// // Excel / CSV Storage
// // ======================================================
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/excel");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const excelUpload = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) or CSV files are allowed"));
    }
  },
});

// ***********************************************//
// Import Excel / CSV
// ***********************************************//
route.post(
  "/survey/import",
  excelUpload.single("file"),
  importSurveysFromExcel,
);

// ***********************************************//
// Create Surveys Router
// ***********************************************//
route.post(
  "/survey",
  upload.fields([
    { name: "imgOne", maxCount: 1 },
    { name: "imgTwo", maxCount: 1 },
    { name: "land_owner_doc", maxCount: 1 },
  ]),
  createSurvey,
);
// ***********************************************//
// GET All Surveys Router
// ***********************************************//
route.get("/surveys", getAllSurveys);
// ***********************************************//
// UPDATE Survey By Id Router
// ***********************************************//
route.put(
  "/survey/:id",
  upload.fields([
    { name: "imgOne", maxCount: 1 },
    { name: "imgTwo", maxCount: 1 },
    { name: "land_owner_doc", maxCount: 1 },
  ]),
  updateSurvey,
);
// ***********************************************//
// DELETE Survey By Id Router
// ***********************************************//
route.delete("/survey/:id", deleteSurvey);
// ***********************************************//
// DELETE Survey By Id Router
// ***********************************************//
route.get("/survey/:id", getSurveyById);
// ***********************************************//
// GET Survey by sr_no Router
// ***********************************************//
route.get("/sr_no/:sr_no", getSurveyBySrNo);


export default route;
