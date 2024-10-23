const express = require("express");
const router = express.Router();
const upload = require("../../../middlewares/uploadMiddleware");
const {
  uploadLetterController,
  getLettersController,
  deleteLetterController,
  sendLetterController,
  getLettersForULBController,
  getNotificationsController,
} = require("../../controllers/letterUpload/letterUploadController");
// const roleMiddleware = require("../../../middlewares/roleMiddleware");

// Route to upload a letter
router.post(
  "/letter",
  // roleMiddleware(["SUDA FC"]),
  upload.single("letter"),
  uploadLetterController
);

// Route to get all active letters
router.get("/letters", getLettersController);

// Route to soft delete a letter
router.post("/letter/:id", deleteLetterController);

// Route for sending a letter to a specific ULB or all ULBs
router.post("/send-letter", sendLetterController);
router.get("/letters/ulb", getLettersForULBController);
router.get("/letters/ulb/notifications", getNotificationsController);

module.exports = router;
