const express = require("express");
const router = express.Router();
const upload = require("../../../middlewares/uploadMiddleware");
const {
  uploadLetterController,
  getLettersController,
  deleteLetterController,
  sendLetterController,
  getLettersForULBController,
} = require("../../controllers/letterUpload/letterUploadController");

// Route to upload a letter
router.post("/letter", upload.single("letter"), uploadLetterController);

// Route to get all active letters
router.get("/letters", getLettersController);

// Route to soft delete a letter
router.delete("/letter/:id", deleteLetterController);

// Route for sending a letter to a specific ULB or all ULBs
router.post("/send-letter", sendLetterController);
router.get("/letters/ulb/:ulb_id", getLettersForULBController);

module.exports = router;
