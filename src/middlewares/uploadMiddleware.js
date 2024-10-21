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

// File filter to allow specific file types and set limits
const fileFilter = (req, file, cb) => {
  // Set size limit based on the file type
  const isPdf = file.mimetype === "application/pdf";
  const isImage = file.mimetype.startsWith("image/");

  if (isPdf) {
    cb(null, true); // Allow PDF files
  } else if (isImage) {
    cb(null, true); // Allow image files
  } else {
    cb(new Error("Only PDF and image files are allowed"), false);
  }
};

// Set file size limit based on file type
const limits = (req, file, cb) => {
  const isPdf = file.mimetype === "application/pdf";
  const isImage = file.mimetype.startsWith("image/");

  if (isPdf) {
    cb(null, { fileSize: 2 * 1024 * 1024 }); // 2 MB for PDFs
  } else if (isImage) {
    cb(null, { fileSize: 200 * 1024 }); // 200 KB for images
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Set up multer with the defined storage, file filter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;
