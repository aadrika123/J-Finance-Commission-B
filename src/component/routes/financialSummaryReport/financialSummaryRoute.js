const express = require("express");
const router = express.Router();
const {
  getFinancialSummaryReport,
  updateFinancialSummaryReport,
} = require("../../controllers/financialSummaryReport/financialSummaryController");

// Define the route for fetching financial summary report
router.get("/financial-summary", getFinancialSummaryReport);
router.post("/financial-summary/update", updateFinancialSummaryReport);

module.exports = router;
