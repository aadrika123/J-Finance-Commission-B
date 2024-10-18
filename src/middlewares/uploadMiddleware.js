const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "./utils/fileUpload/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow specific file types (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Set file size limit to 10MB (optional)
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
};

// Set up multer with the defined storage, file filter, and size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;
