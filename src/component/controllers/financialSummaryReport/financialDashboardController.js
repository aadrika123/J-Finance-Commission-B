const financialDao = require("../../dao/financialSummaryReport/financialDashboardDao");
const logger = require("../../../utils/log/logger");

const getFilteredFinancialSummaryMillionPlus = async (req, res) => {
  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query;

    logger.info("Fetching financial summary with filters:", {
      ulb_name,
      grant_type,
      financial_year,
      sector,
    });

    const filters = {
      ulb_name,
      grant_type,
      financial_year: parseInt(financial_year, 10),
      sector,
    };

    const financialSummary =
      await financialDao.fetchFinancialSummaryReportMillionPlus(filters);

    if (!financialSummary || financialSummary.length === 0) {
      logger.warn("No financial summary data found");
      return res.status(404).json({
        status: false,
        message: "No financial summary data found",
      });
    }

    logger.info("Financial summary fetched successfully", {
      total_records: financialSummary.length,
    });

    res.status(200).json({
      status: true,
      message: "Financial summary fetched successfully",
      data: financialSummary,
    });
  } catch (error) {
    logger.error("Error fetching financial summary:", { error });
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary",
      error: error.message,
    });
  }
};

const getFilteredFinancialSummaryNonMillionPlus = async (req, res) => {
  const { grant_type, sector, financial_year } = req.query;

  try {
    // Import the correct function from the DAO
    const financialSummary =
      await financialDao.fetchFinancialSummaryReportNonMillionPlus(
        grant_type,
        sector,
        financial_year
      );

    if (!financialSummary || financialSummary.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No financial summary data found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Financial summary data fetched successfully",
      data: financialSummary,
    });
  } catch (error) {
    console.error("Error fetching financial summary data:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary data",
      error: error.message,
    });
  }
};

module.exports = {
  getFilteredFinancialSummaryMillionPlus,
  getFilteredFinancialSummaryNonMillionPlus,
};
