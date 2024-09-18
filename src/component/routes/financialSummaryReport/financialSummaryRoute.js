const express = require("express");
const router = express.Router();
const {
  getFinancialSummaryReport,
  updateFinancialSummaryReport,
  getUpdatedFinancialSummaryReport,
} = require("../../controllers/financialSummaryReport/financialSummaryController");

// Route to fetch the financial summary report
// This endpoint triggers the controller function to handle fetching of the financial summary
router.get("/financial-summary", getFinancialSummaryReport);

// Route to update the financial summary report
// This endpoint uses POST method to trigger the controller function to handle updates
router.post("/financial-summary/update", updateFinancialSummaryReport);

// Route to fetch updated financial summary reports
// This endpoint triggers the controller function to handle fetching of updated financial summaries
router.get("/financial-summary/updated", getUpdatedFinancialSummaryReport);

module.exports = router;
