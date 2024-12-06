const { PrismaClient } = require("@prisma/client");
const {
  updateSchemeInfo,
  updateSchemeById
} = require("../../dao/schemeInfo/schemeInfoUpdateDao");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger");
const moment = require('moment');
const prisma = new PrismaClient();

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
    if (!updatedSchemeInfo.status) {
      // Return the validation error directly
      return res.status(200).json(updatedSchemeInfo);
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
    await createAuditLog(userId, "UPDATE", "scheme_info", scheme_id, {
      oldData: data, // Optionally log old data if available
      newData: updatedSchemeInfo.data, // Log only the new data
    });

    // Send a success response with the updated scheme information
    res.status(200).json(updatedSchemeInfo);
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

async function updateScheme(req, res) {
  const { scheme_id } = req.params;
  const {
    project_cost,
    scheme_name,
    sector,
    grant_type,
    date_of_approval,
    financial_year,
  } = req.body;

  const userId = req.body?.auth?.id || null; // Get user ID from request
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP


  // Prepare the data for updating
  let updatedDateOfApproval = date_of_approval;

  // If date_of_approval is in 'YYYY-MM-DD' format (without time), convert it to a Date object
  if (updatedDateOfApproval && typeof updatedDateOfApproval === 'string') {
    updatedDateOfApproval = moment(updatedDateOfApproval, 'YYYY-MM-DD').utc().toDate();
  }

  // Prepare the data for updating
  const updatedData = {
    project_cost,
    scheme_name,
    sector,
    grant_type,
    date_of_approval:updatedDateOfApproval,
    financial_year,
    approved_project_cost:project_cost,
    updated_at: new Date(), // Ensure to update the timestamp
  };

  try {
    // Log the attempt to update scheme
    logger.info("Attempting to update scheme information...", {
      userId,
      action: "UPDATE_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      updatedData,
    });

    // First, retrieve the old data (current scheme info)
    const oldScheme = await prisma.scheme_info.findUnique({
      where: { scheme_id: scheme_id },
    });

    if (!oldScheme) {
      throw new Error(`Scheme with ID ${scheme_id} not found`);
    }

    // Call the DAO function to update the scheme
    const updatedScheme = await updateSchemeById(scheme_id, updatedData, userId, clientIp);

    // Log the audit information: old data vs new data
    await createAuditLog(userId, "UPDATE", "scheme_info", scheme_id, {
      oldData: oldScheme,  // Log old data (before the update)
      newData: updatedScheme, // Log new data (after the update)
    });

    // Return the success response
    return res.status(200).json({
      message: 'Scheme updated successfully',
      updatedScheme,
    });
  } catch (error) {
    // Log and return the error
    logger.error("Error updating scheme information:", error);
    return res.status(400).json({
      status: false,
      message: `Error updating scheme information: ${error.message}`,
    });
  }
}
module.exports = {
  modifySchemeInfo,
  updateScheme
};
