const express = require("express");
const router = express.Router();
const {
  getFinancialSummaryReport,
  createFundReleaseController,
  getFundReleaseReport,
} = require("../../controllers/financialSummaryReport/financialSummaryController");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

// Route to fetch the financial summary report
// This endpoint triggers the controller function to handle fetching of the financial summary
router.get(
  "/financial-summary",
  roleMiddleware(["SUDA FC"]),
  getFinancialSummaryReport
);

// Route to update the financial summary report
// This endpoint uses POST method to trigger the controller function to handle updates
router.post(
  "/fund-release",
  roleMiddleware(["SUDA FC"]),
  // updateFinancialSummaryReport
  createFundReleaseController
);

router.get(
  "/fund-released",
  roleMiddleware(["SUDA FC", "EO FC"]),
  getFundReleaseReport
);

module.exports = router;
