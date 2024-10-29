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
const roleMiddleware = require("../../../middlewares/roleMiddleware");

// Route to upload a letter
router.post(
  "/letter",
  // roleMiddleware(["SUDA FC"]),
  upload.single("letter"),
  uploadLetterController
);

// Route to get all active letters
router.get(
  "/letters",
  // roleMiddleware(["SUDA FC"]),
  getLettersController
);

// Route to soft delete a letter
router.post(
  "/letter/:id",
  // roleMiddleware(["SUDA FC"]),
  deleteLetterController
);

// Route for sending a letter to a specific ULB or all ULBs
router.post("/send-letter", roleMiddleware(["SUDA FC"]), sendLetterController);
router.get(
  "/letters/ulb",
  roleMiddleware(["EO FC"]),
  getLettersForULBController
);
router.get(
  "/letters/ulb/notifications",
  roleMiddleware(["EO FC"]),
  getNotificationsController
);

module.exports = router;
