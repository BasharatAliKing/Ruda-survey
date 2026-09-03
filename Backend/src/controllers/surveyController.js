import Survey from "../models/surveyModel.js";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

//**************************************************** */
// Import Surveys from Excel / CSV
//*************************************************** */

export const importSurveysFromExcel = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel or CSV file is required",
      });
    }

    //**************************************************** */
    //  Read Excel / CSV file
    //**************************************************** */

    const workbook = XLSX.readFile(req.file.path);

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    //**************************************************** */
    // Convert Excel rows to Survey documents
    //**************************************************** */

    const surveys = rows.map((row) => ({
      sr_no: Number(row.sr_no),
      parcel_id: row.parcel_id,
      rd: row.rd,
      pkg: row.pkg,
      village: row.village,

      // Coordinates
      coordinates: {
        lat: row.lat ? Number(row.lat) : undefined,
        lng: row.lng ? Number(row.lng) : undefined,
      },

      // Identification
      identification: {
        owner_name: row.owner_name,
        f_name: row.f_name,
        cnic: row.cnic,
        khasra_no: row.khasra_no,
        phone: row.phone,
        electricity_connection_name: row.electricity_connection_name,
        land_area: row.land_area,

        // Excel import doesn't contain uploaded PDF
        land_owner_doc: "",
      },

      // Other fields
      status: row.status,
      stractural_name: row.stractural_name,

      // Covered area
      covered_area: {
        length: row.length,
        width: row.width,
        area: row.area,
      },
      nature_of_construction: row.nature_of_construction,

      // Excel import doesn't contain images
      imgOne: "",
      imgTwo: "",
    }));

    //**************************************************** */
    // Validate required data
    //**************************************************** */

    const invalidRows = surveys
      .map((survey, index) => {
        const errors = [];
        if (!survey.sr_no || Number.isNaN(survey.sr_no)) {
          errors.push("sr_no is required");
        }
        // if (!survey.parcel_id) {
        //   errors.push("parcel_id is required");
        // }
        // if (!survey.rd) {
        //   errors.push("rd is required");
        // }
        return errors.length
          ? {
              row: index + 2,
              errors,
            }
          : null;
      })
      .filter(Boolean);

    if (invalidRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some rows contain invalid data",
        invalidRows,
      });
    }

    //**************************************************** */
    // Insert all surveys into MongoDB
    //**************************************************** */

    const insertedSurveys = await Survey.insertMany(surveys);

    //**************************************************** */
    // Delete uploaded Excel file
    //**************************************************** */

    // Optional cleanup
    // You can add fs.unlink here if you want
    // to remove the uploaded Excel file after import.

    return res.status(201).json({
      success: true,

      message: `${insertedSurveys.length} surveys imported successfully`,

      total: insertedSurveys.length,

      data: insertedSurveys,
    });
  } catch (error) {
    console.error("Excel Import Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to import surveys",

      error: error.message,
    });
  }
};
// ***********************************************//
// Create Survey
// ***********************************************//
export const createSurvey = async (req, res) => {
  try {
    // ***********************************************//
    // 1. Get normal form fields
    // ***********************************************//
    const {
      sr_no,
      parcel_id,
      rd,
      pkg,
      village,

      // Identification
      owner_name,
      f_name,
      cnic,
      khasra_no,
      phone,
      electricity_connection_name,
      land_area,

      // Other fields
      status,
      stractural_name,

      // Covered area
      length,
      width,
      area,

      nature_of_construction,
    } = req.body;

    // ***********************************************//
    // 2. Get uploaded files
    // ***********************************************//
    const imgOne = req.files?.imgOne?.[0];
    const imgTwo = req.files?.imgTwo?.[0];
    const landOwnerDoc = req.files?.land_owner_doc?.[0];

    // ***********************************************//
    // 3. Create survey
    // ***********************************************//
    const survey = await Survey.create({
      sr_no: Number(sr_no),
      parcel_id,
      rd,
      pkg,
      village,
      // Coordinates
      coordinates: {
        lat: req.body.lat ? Number(req.body.lat) : undefined,
        lng: req.body.lng ? Number(req.body.lng) : undefined,
      },
      // Identification
      identification: {
        owner_name,
        f_name,
        cnic,
        khasra_no,
        phone,
        land_owner_doc: `/images/${landOwnerDoc.filename}`,
        electricity_connection_name,
        land_area,
      },
      // Other information
      status,
      stractural_name,
      // Covered area
      covered_area: {
        length,
        width,
        area,
      },
      nature_of_construction,
      // Images
      imgOne: `/images/${imgOne.filename}`,
      imgTwo: `/images/${imgTwo.filename}`,
    });

    return res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: survey,
    });
  } catch (error) {
    console.error("Create Survey Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create survey",
      error: error.message,
    });
  }
};
// ***********************************************//
// GET All Surveys
// ***********************************************//
export const getAllSurveys = async (req, res) => {
  try {
    const data = await Survey.find();
    res.status(200).json({
      success: true,
      message: "Surveys data fetched Successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get surveys",
      error: error.message,
    });
  }
};
// ***********************************************//
// Update Survey
// ***********************************************//

export const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    // ***********************************************//
    //   Check if survey exists
    // ***********************************************//

    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey data not found",
      });
    }

    // ***********************************************//
    // Get form fields
    // ***********************************************//

    const {
      sr_no,
      parcel_id,
      rd,
      pkg,
      village,
      // Coordinates
      lat,
      lng,
      // Identification
      owner_name,
      f_name,
      cnic,
      khasra_no,
      phone,
      electricity_connection_name,
      land_area,

      // Other
      status,
      stractural_name,

      // Covered area
      length,
      width,
      area,

      nature_of_construction,
    } = req.body;

    // ***********************************************//
    // Get uploaded files
    // ***********************************************//

    const imgOne = req.files?.imgOne?.[0];
    const imgTwo = req.files?.imgTwo?.[0];
    const landOwnerDoc = req.files?.land_owner_doc?.[0];

    // ***********************************************//
    // Update normal fields
    // ***********************************************//

    if (sr_no !== undefined) {
      survey.sr_no = Number(sr_no);
    }

    if (parcel_id !== undefined) {
      survey.parcel_id = parcel_id;
    }

    if (rd !== undefined) {
      survey.rd = rd;
    }

    if (pkg !== undefined) {
      survey.pkg = pkg;
    }

    if (village !== undefined) {
      survey.village = village;
    }

    // ***********************************************//
    // Update coordinates
    // ***********************************************//

    if (lat !== undefined) {
      survey.coordinates.lat = Number(lat);
    }

    if (lng !== undefined) {
      survey.coordinates.lng = Number(lng);
    }

    // ***********************************************//
    // Update identification
    // ***********************************************//

    if (owner_name !== undefined) {
      survey.identification.owner_name = owner_name;
    }

    if (f_name !== undefined) {
      survey.identification.f_name = f_name;
    }

    if (cnic !== undefined) {
      survey.identification.cnic = cnic;
    }

    if (khasra_no !== undefined) {
      survey.identification.khasra_no = khasra_no;
    }

    if (phone !== undefined) {
      survey.identification.phone = phone;
    }

    if (electricity_connection_name !== undefined) {
      survey.identification.electricity_connection_name =
        electricity_connection_name;
    }

    if (land_area !== undefined) {
      survey.identification.land_area = land_area;
    }

    // ***********************************************//
    // Update other fields
    // ***********************************************//

    if (status !== undefined) {
      survey.status = status;
    }

    if (stractural_name !== undefined) {
      survey.stractural_name = stractural_name;
    }

    if (nature_of_construction !== undefined) {
      survey.nature_of_construction = nature_of_construction;
    }

    // ***********************************************//
    // Update covered area
    // ***********************************************//

    if (length !== undefined) {
      survey.covered_area.length = length;
    }

    if (width !== undefined) {
      survey.covered_area.width = width;
    }

    if (area !== undefined) {
      survey.covered_area.area = area;
    }

    // ***********************************************//
    // Update images if new files are uploaded
    // ***********************************************//

    if (imgOne) {
      survey.imgOne = `/images/${imgOne.filename}`;
    }

    if (imgTwo) {
      survey.imgTwo = `/images/${imgTwo.filename}`;
    }

    // ***********************************************//
    // Update PDF if new PDF is uploaded
    // ***********************************************//

    if (landOwnerDoc) {
      survey.identification.land_owner_doc = `/images/${landOwnerDoc.filename}`;
    }

    // ***********************************************//
    // Save updated survey
    // ***********************************************//

    const updatedSurvey = await survey.save();

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: updatedSurvey,
    });
  } catch (error) {
    console.error("Update Survey Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update survey",
      error: error.message,
    });
  }
};

// ***********************************************//
//  DELETE Survey By Id Here
// ***********************************************//
export const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    // Find survey first
    const survey = await Survey.findById(id);
    if (!survey) {
      return res
        .status(404)
        .json({ success: false, message: "Survey data not found by this ID" });
    }
    // Helper function to delete uploaded file
    const deleteFile = (filePath) => {
      if (!filePath) return;
      // Convert "/images/file.jpg" to "public/images/file.jpg"
      const fullPath = path.join(
        process.cwd(),
        "public",
        filePath.replace(/^\/+/, ""),
      );
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };
    // Delete image 1
    deleteFile(survey.imgOne);
    // // Delete image 2
    deleteFile(survey.imgTwo);
    //  // Delete land owner document
    deleteFile(survey.identification?.land_owner_doc);
    // Delete survey from MongoDB
    await Survey.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
      data: { id: survey._id },
    });
  } catch (error) {
    console.error("Delete Survey Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete survey",
      error: error.message,
    });
  }
};
// ***********************************************//
//  GET Survey By Id Here
// ***********************************************//
export const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Survey.findById(id);
    
    res
      .status(200)
      .json({
        success: true,
        message: "Survey Data fetched successfully.",
        data,
      });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get survey by ID",
      error: err.message,
    });
  }
};
