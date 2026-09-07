
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// ***********************************************//
// // Excel / CSV Storage
// ***********************************************//

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/excel");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
export const excelUpload = multer({
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

