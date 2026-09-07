import express from "express";
import {
  importSurveysFromExcel,
  createSurvey,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
  getSurveyById,
  getSurveyBySrNo,
} from "../controllers/surveyController.js";

import {upload,excelUpload} from "../middleware/upload.js";

const route = express.Router();


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
