const express = require("express");
const {
  getFilteredFinancialSummaryMillionPlus,
  getFilteredFinancialSummaryNonMillionPlus,
} = require("../../controllers/financialSummaryReport/financialDashboardController");

const router = express.Router();

// Route to get financial summary for Million Plus Cities
// This endpoint calls the controller function to handle the request
router.get("/financial-DB-MillionPlus", getFilteredFinancialSummaryMillionPlus);

// Route to get financial summary for Non-Million Plus Cities
// This endpoint calls the controller function to handle the request
router.get(
  "/financial-DB-NonMillionPlus",
  getFilteredFinancialSummaryNonMillionPlus
);

module.exports = router;
