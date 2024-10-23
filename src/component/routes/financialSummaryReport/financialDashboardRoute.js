const express = require("express");
const {
  getFilteredFinancialSummaryMillionPlus,
  getFilteredFinancialSummaryNonMillionPlus,
} = require("../../controllers/financialSummaryReport/financialDashboardController");
// const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

// Route to get financial summary for Million Plus Cities
// This endpoint calls the controller function to handle the request
router.get(
  "/financial-DB-MillionPlus",
  // roleMiddleware(["SUDA FC"]),
  getFilteredFinancialSummaryMillionPlus
);

// Route to get financial summary for Non-Million Plus Cities
// This endpoint calls the controller function to handle the request
router.get(
  "/financial-DB-NonMillionPlus",
  // roleMiddleware(["SUDA FC"]),
  getFilteredFinancialSummaryNonMillionPlus
);

module.exports = router;
