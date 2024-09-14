const ulbDao = require("../../dao/ulb/ulbDao");
const logger = require("../../../utils/log/logger"); // Import logger

const getULBs = async (req, res) => {
  try {
    logger.info("Fetching ULBs from the database...");

    const ulbs = await ulbDao.getULBs();

    // Convert BigInt values to strings if necessary
    const formattedULBs = ulbs.map((ulb) => ({
      ...ulb,
      id: ulb.id.toString(), // Convert id to string
      fund_release_to_ulbs: ulb.fund_release_to_ulbs?.toString(),
      amount: ulb.amount?.toString(),
      expenditure: ulb.expenditure?.toString(),
      balance_amount: ulb.balance_amount?.toString(),
      total_financial_progress: ulb.total_financial_progress?.toString(),
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

module.exports = {
  getULBs,
};
