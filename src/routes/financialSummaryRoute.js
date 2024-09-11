const express = require("express");
const router = express.Router();
const {
  getFinancialSummaryReport,
} = require("../controllers/financialSummaryController");

// Define the route for fetching financial summary report
router.get("/financial-summary", getFinancialSummaryReport);

module.exports = router;
