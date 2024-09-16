const ulbDao = require("../../dao/ulb/ulbDao");
const logger = require("../../../utils/log/logger"); // Import logger
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Import audit logger

const getULBs = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null; // Get user ID from request
    logger.info("Fetching ULBs from the database...", {
      userId,
      action: "FETCH_ULBs",
      ip: clientIp, // Include IP in the log
    });

    const ulbs = await ulbDao.getULBs();

    // Convert BigInt values to strings if necessary
    const formattedULBs = ulbs.map((ulb) => ({
      ...ulb,
      id: ulb.id.toString(),
      fund_release_to_ulbs: ulb.fund_release_to_ulbs?.toString(),
      amount: ulb.amount?.toString(),
      expenditure: ulb.expenditure?.toString(),
      balance_amount: ulb.balance_amount?.toString(),
    }));

    if (!formattedULBs || formattedULBs.length === 0) {
      logger.warn("No ULBs found", {
        userId,
        action: "FETCH_ULBs",
        ip: clientIp,
        resultCount: 0,
      });
      return res.status(404).json({
        status: false,
        message: "No ULBs found",
      });
    }

    // Create an audit log for fetching ULBs
    await createAuditLog(
      userId, // User ID (if available)
      "FETCH",
      "ULB",
      null, // Record ID (not applicable for this fetch operation)
      {
        total_ULBs: formattedULBs.length,
      }
    );

    logger.info("ULBs fetched successfully", {
      userId,
      action: "FETCH_ULBs",
      ip: clientIp,
      resultCount: formattedULBs.length,
    });

    res.status(200).json({
      status: true,
      message: "ULBs fetched successfully",
      data: formattedULBs,
    });
  } catch (error) {
    logger.error("Error fetching ULBs", {
      userId,
      action: "FETCH_ULBs",
      ip: clientIp,
      error: error.message,
    });
    res.status(500).json({
      status: false,
      message: "Error fetching ULBs",
      error: error.message,
    });
  }
};

const getULBsAndSchemes = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;
    logger.info("Fetching ULBs and Schemes from the database...", {
      userId,
      action: "FETCH_ULBs_Schemes",
      ip: clientIp, // Include IP in the log
    });

    const data = await ulbDao.getULBsAndSchemes();

    const formattedData = data.map((item) => ({
      ...item,
      ulb_id: item.ulb_id.toString(),
      scheme_id: item.scheme_id,
      financial_progress_schemeinfo:
        item.financial_progress_schemeinfo?.toString(),
    }));

    if (!formattedData || formattedData.length === 0) {
      logger.warn("No data found", {
        userId,
        action: "FETCH_ULBs_Schemes",
        ip: clientIp,
        resultCount: 0,
      });
      return res.status(404).json({
        status: false,
        message: "No data found",
      });
    }

    await createAuditLog(userId, "FETCH", "ULB_Schemes", null, {
      total_records: formattedData.length,
    });

    logger.info("Data fetched successfully", {
      userId,
      action: "FETCH_ULBs_Schemes",
      ip: clientIp,
      resultCount: formattedData.length,
    });

    res.status(200).json({
      status: true,
      message: "Data fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    logger.error("Error fetching data", {
      userId,
      action: "FETCH_ULBs_Schemes",
      ip: clientIp,
      error: error.message,
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
