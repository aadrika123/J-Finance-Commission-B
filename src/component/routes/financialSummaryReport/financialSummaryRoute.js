const express = require("express");
const router = express.Router();
const {
  getFinancialSummaryReport,
  // updateFinancialSummaryReport,
  createFundReleaseController,
  //
  getUpdatedFinancialSummaryReport,
  getFundReleaseReport,
} = require("../../controllers/financialSummaryReport/financialSummaryController");
// const roleMiddleware = require("../../../middlewares/roleMiddleware");

// Route to fetch the financial summary report
// This endpoint triggers the controller function to handle fetching of the financial summary
router.get(
  "/financial-summary",
  // roleMiddleware(["SUDA FC"]),
  getFinancialSummaryReport
);

// Route to update the financial summary report
// This endpoint uses POST method to trigger the controller function to handle updates
router.post(
  "/fund-release",
  // roleMiddleware(["SUDA FC"]),
  // updateFinancialSummaryReport
  createFundReleaseController
);

// Route to fetch updated financial summary reports
// This endpoint triggers the controller function to handle fetching of updated financial summaries
router.get(
  "/financial-summary/updated",
  // roleMiddleware(["EO FC"]),
  getUpdatedFinancialSummaryReport
);
router.get(
  "/fund-released",
  // roleMiddleware(["SUDA FC"]),
  getFundReleaseReport
);

module.exports = router;
