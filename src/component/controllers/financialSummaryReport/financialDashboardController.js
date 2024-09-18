const financialDao = require("../../dao/financialSummaryReport/financialDashboardDao");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Import audit logger

const convertBigIntToString = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      obj[key] = obj[key].toString(); // Convert BigInt to string
    }
  }
  return obj;
};

const getFilteredFinancialSummaryMillionPlus = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query;

    // Validate and sanitize query parameters
    const filters = {
      ulb_name: ulb_name || null,
      grant_type: grant_type || null,
      financial_year: financial_year ? parseInt(financial_year, 10) : null,
      sector: sector || null,
    };

    if (filters.financial_year && isNaN(filters.financial_year)) {
      return res.status(400).json({
        status: false,
        message: "Invalid financial year",
      });
    }

    logger.info("Fetching financial summary for Million Plus Cities...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
      ip: clientIp,
      filters,
    });

    const financialSummary =
      await financialDao.fetchFinancialSummaryReportMillionPlus(filters);

    if (!financialSummary || financialSummary.length === 0) {
      logger.warn("No financial summary data found for Million Plus Cities.", {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
        ip: clientIp,
        filters,
      });

      return res.status(200).json({
        status: true,
        message: "No financial summary data found",
        data: [],
      });
    }

    // Convert BigInt to string in the results
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    // Audit Log for fetching Million Plus Cities data
    await createAuditLog(userId, "FETCH", "FinancialSummaryReport", null, {
      actionDetails: `Fetched financial summary for Million Plus Cities with filters: ${JSON.stringify(
        filters
      )}`,
    });

    logger.info(
      "Financial summary for Million Plus Cities fetched successfully.",
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
        ip: clientIp,
        resultCount: sanitizedData.length,
      }
    );

    res.status(200).json({
      status: true,
      message: "Financial summary fetched successfully",
      data: sanitizedData,
    });
  } catch (error) {
    logger.error(
      `Error fetching financial summary for Million Plus Cities: ${error.message}`,
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
        ip: clientIp,
        error: error.message,
      }
    );
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary",
      error: error.message,
    });
  }
};

const getFilteredFinancialSummaryNonMillionPlus = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query;

    // Validate and sanitize query parameters
    const filters = {
      ulb_name: ulb_name || null,
      grant_type: grant_type || null,
      financial_year: financial_year ? parseInt(financial_year, 10) : null,
      sector: sector || null,
    };

    if (filters.financial_year && isNaN(filters.financial_year)) {
      return res.status(400).json({
        status: false,
        message: "Invalid financial year",
      });
    }

    logger.info("Fetching financial summary for Non-Million Plus Cities...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
      ip: clientIp,
      filters,
    });

    const financialSummary =
      await financialDao.fetchFinancialSummaryReportNonMillionPlus(filters);

    if (!financialSummary || financialSummary.length === 0) {
      logger.warn(
        "No financial summary data found for Non-Million Plus Cities.",
        {
          userId,
          action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
          ip: clientIp,
          filters,
        }
      );

      return res.status(200).json({
        status: true,
        message: "No financial summary data found",
        data: [],
      });
    }

    // Convert BigInt to string in the results
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    // Audit Log for fetching Non-Million Plus Cities data
    await createAuditLog(userId, "FETCH", "FinancialSummaryReport", null, {
      actionDetails: `Fetched financial summary for Non-Million Plus Cities with filters: ${JSON.stringify(
        filters
      )}`,
    });

    logger.info(
      "Financial summary for Non-Million Plus Cities fetched successfully.",
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
        ip: clientIp,
        resultCount: sanitizedData.length,
      }
    );

    res.status(200).json({
      status: true,
      message: "Financial summary data fetched successfully",
      data: sanitizedData,
    });
  } catch (error) {
    logger.error(
      `Error fetching financial summary for Non-Million Plus Cities: ${error.message}`,
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
        ip: clientIp,
        error: error.message,
      }
    );
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
