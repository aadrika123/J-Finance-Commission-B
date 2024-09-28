const financialDao = require("../../dao/financialSummaryReport/financialDashboardDao");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger");

// Helper function to convert BigInt values to strings to avoid issues in JSON responses
const convertBigIntToString = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      obj[key] = obj[key].toString(); // Convert BigInt to string
    }
  }
  return obj;
};

/**
 * Controller function to fetch filtered financial summaries for Million Plus Cities.
 * @param {Object} req - The request object containing query parameters and user authentication details.
 * @param {Object} res - The response object used to send the result back to the client.
 */
const getFilteredFinancialSummaryMillionPlus = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture client's IP address
  const userId = req.body?.auth?.id || null; // Get user ID from request if authenticated

  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query; // Updated grant_type to fr_grant_type

    // Prepare filters from query parameters with proper sanitization and validation
    const filters = {
      ulb_name: ulb_name || null,
      grant_type: grant_type || null, // Updated field
      financial_year: financial_year ? parseInt(financial_year, 10) : null,
      sector: sector || null,
    };

    // Check if the financial year is a valid number
    if (filters.financial_year && isNaN(filters.financial_year)) {
      return res.status(400).json({
        status: false,
        message: "Invalid financial year",
      });
    }

    // Log the action of fetching financial data for Million Plus Cities
    logger.info("Fetching financial summary for Million Plus Cities...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
      ip: clientIp,
      filters,
    });

    // Fetch the financial summary report from the DAO layer using the provided filters
    const financialSummary =
      await financialDao.fetchFinancialSummaryReportMillionPlus(filters);

    // Check if no data was returned from the DAO and log a warning
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

    // Convert BigInt values in the financial summary results to strings
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    // Record the action in the audit log for tracking
    await createAuditLog(userId, "FETCH", "FinancialSummaryReport", null, {
      actionDetails: `Fetched financial summary for Million Plus Cities with filters: ${JSON.stringify(
        filters
      )}`,
    });

    // Log the successful fetch operation
    logger.info(
      "Financial summary for Million Plus Cities fetched successfully.",
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
        ip: clientIp,
        resultCount: sanitizedData.length,
      }
    );

    // Return the fetched data in the response
    res.status(200).json({
      status: true,
      message: "Financial summary fetched successfully",
      data: sanitizedData,
    });
  } catch (error) {
    // Log any errors that occur during the process
    logger.error(
      `Error fetching financial summary for Million Plus Cities: ${error.message}`,
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_MILLION_PLUS",
        ip: clientIp,
        error: error.message,
      }
    );

    // Return an error response to the client
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary",
      error: error.message,
    });
  }
};

/**
 * Controller function to fetch filtered financial summaries for Non-Million Plus Cities.
 * @param {Object} req - The request object containing query parameters and user authentication details.
 * @param {Object} res - The response object used to send the result back to the client.
 */
const getFilteredFinancialSummaryNonMillionPlus = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture client's IP address
  const userId = req.body?.auth?.id || null; // Get user ID from request if authenticated

  try {
    const { ulb_name, grant_type, financial_year, sector } = req.query; // Updated grant_type to fr_grant_type

    // Prepare filters from query parameters with proper sanitization and validation
    const filters = {
      ulb_name: ulb_name || null,
      grant_type: grant_type || null, // Updated field
      financial_year: financial_year ? parseInt(financial_year, 10) : null,
      sector: sector || null,
    };

    // Check if the financial year is a valid number
    if (filters.financial_year && isNaN(filters.financial_year)) {
      return res.status(400).json({
        status: false,
        message: "Invalid financial year",
      });
    }

    // Log the action of fetching financial data for Non-Million Plus Cities
    logger.info("Fetching financial summary for Non-Million Plus Cities...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
      ip: clientIp,
      filters,
    });

    // Fetch the financial summary report from the DAO layer using the provided filters
    const financialSummary =
      await financialDao.fetchFinancialSummaryReportNonMillionPlus(filters);

    // Check if no data was returned from the DAO and log a warning
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

    // Convert BigInt values in the financial summary results to strings
    const sanitizedData = financialSummary.map((item) =>
      convertBigIntToString(item)
    );

    // Record the action in the audit log for tracking
    await createAuditLog(userId, "FETCH", "FinancialSummaryReport", null, {
      actionDetails: `Fetched financial summary for Non-Million Plus Cities with filters: ${JSON.stringify(
        filters
      )}`,
    });

    // Log the successful fetch operation
    logger.info(
      "Financial summary for Non-Million Plus Cities fetched successfully.",
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
        ip: clientIp,
        resultCount: sanitizedData.length,
      }
    );

    // Return the fetched data in the response
    res.status(200).json({
      status: true,
      message: "Financial summary data fetched successfully",
      data: sanitizedData,
    });
  } catch (error) {
    // Log any errors that occur during the process
    logger.error(
      `Error fetching financial summary for Non-Million Plus Cities: ${error.message}`,
      {
        userId,
        action: "FETCH_FINANCIAL_SUMMARY_NON_MILLION_PLUS",
        ip: clientIp,
        error: error.message,
      }
    );

    // Return an error response to the client
    res.status(500).json({
      status: false,
      message: "Error fetching financial summary data",
      error: error.message,
    });
  }
};

// Export the functions to be used in routes
module.exports = {
  getFilteredFinancialSummaryMillionPlus,
  getFilteredFinancialSummaryNonMillionPlus,
};
