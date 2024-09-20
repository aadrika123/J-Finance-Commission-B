const ulbDao = require("../../dao/ulb/ulbDao");
const logger = require("../../../utils/log/logger"); // Import logger for logging events and errors
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Import audit logger for tracking changes

/**
 * Fetches ULBs (Urban Local Bodies) from the database.
 *
 * This function:
 * 1. Captures the client's IP address for logging.
 * 2. Logs an informational message about the attempt to fetch ULBs.
 * 3. Retrieves the list of ULBs using the `ulbDao.getULBs()` method.
 * 4. Formats the retrieved ULBs by converting BigInt values to strings.
 * 5. Checks if any ULBs were found and sends a 404 response if none were found.
 * 6. Creates an audit log entry for the fetch operation, including the total number of ULBs retrieved.
 * 7. Logs a successful fetch and sends a 200 response with the ULB data.
 * 8. Catches and handles any errors that occur during the fetch operation.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and ULB data, or an error message.
 */
const getULBs = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP address of the client

  try {
    const userId = req.body?.auth?.id || null; // Extract user ID from request body if available
    logger.info("Fetching ULBs from the database...", {
      userId,
      action: "FETCH_ULBs", // Log action type
      ip: clientIp, // Include IP address in the log
    });

    // Fetch ULBs from the data access layer
    const ulbs = await ulbDao.getULBs();

    // Convert BigInt values to strings for consistent data format
    const formattedULBs = ulbs.map((ulb) => ({
      ...ulb,
      id: ulb.id.toString(),
      fund_release_to_ulbs: ulb.fund_release_to_ulbs?.toString(),
      amount: ulb.amount?.toString(),
      expenditure: ulb.expenditure?.toString(),
      balance_amount: ulb.balance_amount?.toString(),
    }));

    // Check if no ULBs were found
    if (!formattedULBs || formattedULBs.length === 0) {
      logger.warn("No ULBs found", {
        userId,
        action: "FETCH_ULBs", // Log action type
        ip: clientIp,
        resultCount: 0, // Log result count
      });
      return res.status(404).json({
        status: false,
        message: "No ULBs found",
      });
    }

    // Create an audit log entry for the fetch operation
    await createAuditLog(
      userId, // User ID (if available)
      "FETCH",
      "ULB",
      null, // No specific record ID for fetch operation
      {
        total_ULBs: formattedULBs.length,
      }
    );

    logger.info("ULBs fetched successfully", {
      userId,
      action: "FETCH_ULBs", // Log action type
      ip: clientIp,
      resultCount: formattedULBs.length, // Log the number of results
    });

    // Send a success response with ULB data
    res.status(200).json({
      status: true,
      message: "ULBs fetched successfully",
      data: formattedULBs,
    });
  } catch (error) {
    // Handle errors and send an error response
    logger.error("Error fetching ULBs", {
      userId,
      action: "FETCH_ULBs", // Log action type
      ip: clientIp,
      error: error.message, // Log error message
    });
    res.status(500).json({
      status: false,
      message: "Error fetching ULBs",
      error: error.message,
    });
  }
};

/**
 * Fetches ULBs and their associated schemes from the database.
 *
 * This function:
 * 1. Captures the client's IP address for logging.
 * 2. Logs an informational message about the attempt to fetch ULBs and schemes.
 * 3. Retrieves the combined data using the `ulbDao.getULBsAndSchemes()` method.
 * 4. Formats the retrieved data, converting relevant values to strings.
 * 5. Checks if any data was found and sends a 404 response if none was found.
 * 6. Creates an audit log entry for the fetch operation, including the total number of records retrieved.
 * 7. Logs a successful fetch and sends a 200 response with the combined data.
 * 8. Catches and handles any errors that occur during the fetch operation.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and data, or an error message.
 */
const getULBsAndSchemes = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP address of the client

  try {
    const userId = req.body?.auth?.id || null; // Extract user ID from request body if available
    logger.info("Fetching ULBs and Schemes from the database...", {
      userId,
      action: "FETCH_ULBs_Schemes", // Log action type
      ip: clientIp, // Include IP address in the log
    });

    // Fetch combined data of ULBs and schemes from the data access layer
    const data = await ulbDao.getULBsAndSchemes();

    // Format the retrieved data, converting relevant fields to strings
    const formattedData = data.map((item) => ({
      ...item,
      ulb_id: item.ulb_id.toString(),
      scheme_id: item.scheme_id,
      financial_progress_schemeinfo:
        item.financial_progress_schemeinfo?.toString(),
    }));

    // Check if no data was found
    if (!formattedData || formattedData.length === 0) {
      logger.warn("No data found", {
        userId,
        action: "FETCH_ULBs_Schemes", // Log action type
        ip: clientIp,
        resultCount: 0, // Log result count
      });
      return res.status(404).json({
        status: false,
        message: "No data found",
      });
    }

    // Create an audit log entry for the fetch operation
    await createAuditLog(userId, "FETCH", "ULB_Schemes", null, {
      total_records: formattedData.length,
    });

    logger.info("Data fetched successfully", {
      userId,
      action: "FETCH_ULBs_Schemes", // Log action type
      ip: clientIp,
      resultCount: formattedData.length, // Log the number of results
    });

    // Send a success response with the combined data
    res.status(200).json({
      status: true,
      message: "Data fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    // Handle errors and send an error response
    logger.error("Error fetching data", {
      userId,
      action: "FETCH_ULBs_Schemes", // Log action type
      ip: clientIp,
      error: error.message, // Log error message
    });
    res.status(500).json({
      status: false,
      message: "Error fetching data",
      error: error.message,
    });
  }
};

module.exports = {
  getULBs,
  getULBsAndSchemes,
};
