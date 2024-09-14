const express = require("express");
const {
  getFilteredFinancialSummaryMillionPlus,
  getFilteredFinancialSummaryNonMillionPlus,
} = require("../../controllers/financialSummaryReport/financialDashboardController");

const router = express.Router();

router.get("/financial-DB-MillionPlus", getFilteredFinancialSummaryMillionPlus);
router.get(
  "/financial-DB-NonMillionPlus",
  getFilteredFinancialSummaryNonMillionPlus
);

module.exports = router;
