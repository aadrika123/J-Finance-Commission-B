const ulbDao = require("../../dao/ulb/ulbDao");
const logger = require("../../../utils/log/logger"); // Import logger

const getULBs = async (req, res) => {
  try {
    logger.info("Fetching ULBs from the database...");

    // console.log(req.body?.auth.id); //to get user data

    const ulbs = await ulbDao.getULBs();

    // Convert BigInt values to strings if necessary
    const formattedULBs = ulbs.map((ulb) => ({
      ...ulb,
      id: ulb.id.toString(), // Convert id to string
      // Optional: Format Decimal fields if Prisma returns them as objects
      fund_release_to_ulbs: ulb.fund_release_to_ulbs?.toString(),
      amount: ulb.amount?.toString(),
      expenditure: ulb.expenditure?.toString(),
      balance_amount: ulb.balance_amount?.toString(),
    }));

    if (!formattedULBs || formattedULBs.length === 0) {
      logger.warn("No ULBs found");
      return res.status(404).json({
        status: false,
        message: "No ULBs found",
      });
    }

    logger.info("ULBs fetched successfully", {
      total_ULBs: formattedULBs.length,
    });

    res.status(200).json({
      status: true,
      message: "ULBs fetched successfully",
      data: formattedULBs,
    });
  } catch (error) {
    logger.error("Error fetching ULBs:", { error });
    res.status(500).json({
      status: false,
      message: "Error fetching ULBs",
      error: error.message,
    });
  }
};
const getULBsAndSchemes = async (req, res) => {
  try {
    logger.info("Fetching ULBs and Schemes from the database...");

    const data = await ulbDao.getULBsAndSchemes();

    // Convert BigInt and Decimal fields to strings if necessary
    const formattedData = data.map((item) => ({
      ...item,
      ulb_id: item.ulb_id.toString(), // Convert ULB id to string
      scheme_id: item.scheme_id, // Scheme ID as string
      financial_progress_schemeinfo:
        item.financial_progress_schemeinfo?.toString(),
    }));

    if (!formattedData || formattedData.length === 0) {
      logger.warn("No data found");
      return res.status(404).json({
        status: false,
        message: "No data found",
      });
    }

    logger.info("Data fetched successfully", {
      total_records: formattedData.length,
    });

    res.status(200).json({
      status: true,
      message: "Data fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    logger.error("Error fetching data:", { error });
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
