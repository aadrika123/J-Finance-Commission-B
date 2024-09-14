const express = require("express");
const financialController = require("../../controllers/financialSummaryReport/financialDashboardController");

const router = express.Router();

router.get("/financial-summary", financialController.getFinancialSummary);

module.exports = router;
