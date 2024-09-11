const {
  fetchFinancialSummaryReport,
} = require("../dao/financialSummaryReport/financialSummaryDao");

const getFinancialSummaryReport = async (req, res) => {
  try {
    const financialSummary = await fetchFinancialSummaryReport();

    res.status(200).json({
      status: true,
      message: "Financial summary report fetched successfully",
      data: financialSummary,
    });
  } catch (error) {
    console.error("Error fetching financial summary report:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch financial summary report",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
};
