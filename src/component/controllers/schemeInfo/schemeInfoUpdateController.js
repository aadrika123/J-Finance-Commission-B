const {
  updateSchemeInfo,
} = require("../../dao/schemeInfo/schemeInfoUpdateDao");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Adjust the path if needed

/**
 *
 * developer - Kaushal Kant Mishra
 *
 * Updates scheme information in the database.
 *
 * This function:
 * 1. Captures the client's IP address for logging purposes.
 * 2. Extracts `scheme_id` from URL parameters and the update data from the request body.
 * 3. Logs an attempt to update the scheme information, including the scheme ID and the data being updated.
 * 4. Calls the `updateSchemeInfo` function to perform the update operation in the database.
 * 5. Checks if the scheme was found and updated. If not, logs a warning and sends a 404 response.
 * 6. Logs the successful update of the scheme information.
 * 7. Creates an audit log entry for the update operation, including both old and new data if available.
 * 8. Sends a success response with the updated scheme information.
 * 9. Catches and handles errors, logging the error details and sending an appropriate error response.
 *
 * @param {Object} req - The request object containing the scheme ID in the URL parameters and the update data in the body.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and updated scheme information, or an error message.
 */
const modifySchemeInfo = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const { scheme_id } = req.params; // Extract scheme ID from URL parameters
  const data = req.body; // Extract update data from request body
  const userId = req.body?.auth?.id || null; // Get user ID from request

  try {
    // Log the attempt to update scheme information
    logger.info(`Attempting to update scheme info with ID: ${scheme_id}`, {
      userId,
      action: "UPDATE_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      data,
    });

    // Perform the update operation
    const updatedSchemeInfo = await updateSchemeInfo(scheme_id, data);

    // Check if the scheme was updated successfully
    if (!updatedSchemeInfo) {
      // Log a warning if the scheme was not found
      logger.warn(`Scheme with ID ${scheme_id} not found`, {
        userId,
        action: "UPDATE_SCHEME_INFO",
        ip: clientIp,
        scheme_id,
      });
      // Send a 404 response if the scheme was not found
      return res.status(404).json({
        status: false,
        message: `Scheme with ID ${scheme_id} not found`,
      });
    }

    // Log the successful update of the scheme information
    logger.info(`Scheme info updated successfully for ID: ${scheme_id}`, {
      userId,
      action: "UPDATE_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      updatedSchemeInfo,
    });

    // Create an audit log entry for the update operation
    await createAuditLog(userId, "UPDATE", "Scheme_info", scheme_id, {
      oldData: data, // Optionally log old data if available
      newData: updatedSchemeInfo,
    });

    // Send a success response with the updated scheme information
    res.status(200).json({
      status: true,
      message: "Scheme info updated successfully",
      data: updatedSchemeInfo,
    });
  } catch (error) {
    // Log error details and send an error response
    logger.error(
      `Error updating scheme info with ID ${scheme_id}: ${error.message}`,
      {
        userId,
        action: "UPDATE_SCHEME_INFO",
        ip: clientIp,
        error: error.message,
      }
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
