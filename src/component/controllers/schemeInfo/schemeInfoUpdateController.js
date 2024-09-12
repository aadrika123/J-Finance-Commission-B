const {
  updateSchemeInfo,
} = require("../../dao/schemeInfo/schemeInfoUpdateDao");
const logger = require("../../../utils/log/logger");

const modifySchemeInfo = async (req, res) => {
  try {
    const { scheme_id } = req.params;
    const data = req.body;

    logger.info(`Attempting to update scheme info with ID: ${scheme_id}`, {
      data,
    });

    const updatedSchemeInfo = await updateSchemeInfo(scheme_id, data);

    if (!updatedSchemeInfo) {
      logger.warn(`Scheme with ID ${scheme_id} not found`);
      return res.status(404).json({
        status: false,
        message: `Scheme with ID ${scheme_id} not found`,
      });
    }

    logger.info(`Scheme info updated successfully for ID: ${scheme_id}`, {
      updatedSchemeInfo,
    });

    res.status(200).json({
      status: true,
      message: "Scheme info updated successfully",
      data: updatedSchemeInfo,
    });
  } catch (error) {
    logger.error(
      `Error updating scheme info with ID ${scheme_id}: ${error.message}`,
      { error }
    );
    res.status(500).json({
      status: false,
      message: "Failed to update scheme info",
      error: error.message,
    });
  }
};

module.exports = {
  modifySchemeInfo,
};
