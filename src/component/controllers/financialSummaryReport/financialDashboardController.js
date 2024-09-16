const financialDao = require("../../dao/financialSummaryReport/financialDashboardDao");
const logger = require("../../../utils/log/logger");

const convertBigIntToString = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      obj[key] = obj[key].toString(); // Convert BigInt to string
    }
  }
  return obj;
};

const getFilteredFinancialSummaryMillionPlus = async (req, res) => {
  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query;

    const filters = {
      ulb_name,
      grant_type,
      financial_year: parseInt(financial_year, 10),
      sector,
    };

    const financialSummary =
      await financialDao.fetchFinancialSummaryReportMillionPlus(filters);

    if (!financialSummary || financialSummary.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No financial summary data found",
      });
    }

    // Convert BigInt to string in the results
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    res.status(200).json({
      status: true,
      message: "Financial summary fetched successfully",
      data: sanitizedData,
    });
  } catch (error) {
    console.error("Error fetching financial summary data:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary",
      error: error.message,
    });
  }
};

const getFilteredFinancialSummaryNonMillionPlus = async (req, res) => {
  const { ulb_name, grant_type, financial_year, sector } = req.query;

  try {
    const filters = {
      ulb_name,
      grant_type,
      financial_year: parseInt(financial_year, 10),
      sector,
    };

    const financialSummary =
      await financialDao.fetchFinancialSummaryReportNonMillionPlus(filters);

    if (!financialSummary || financialSummary.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No financial summary data found",
      });
    }

    // Convert BigInt to string in the results
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    res.status(200).json({
      status: true,
      message: "Financial summary data fetched successfully",
      data: sanitizedData,
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
