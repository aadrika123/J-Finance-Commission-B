const createAuditLog = require("../utils/auditLog/auditLogger"); // Adjust the path as needed

// Middleware for creating audit logs
const auditLogMiddleware = async (req, res, next) => {
  // Extract user ID from authentication data in request body, if available
  const userId = req.user ? req.body?.auth.id : null;

  // Extract table name and action type from request or default to null
  const tableName = req.tableName || null;
  const actionType = req.actionType || null;

  // Extract record ID from request parameters or body
  const recordId =
    (req.params && req.params.id) || (req.body && req.body.id) || null;

  // Check if all required data is available
  if (userId && tableName && actionType && recordId) {
    // Data to be logged
    const changedData = req.body || {};

    try {
      // Create the audit log entry
      await createAuditLog(
        userId,
        actionType,
        tableName,
        recordId,
        changedData
      );
      console.log(
        `Audit log created for userId: ${userId}, tableName: ${tableName}, actionType: ${actionType}, recordId: ${recordId}`
      );
    } catch (error) {
      // Log any errors encountered during audit log creation
      console.error(`Failed to create audit log: ${error.message}`);
    }
  } else {
    // Log a warning if any required data is missing
    console.warn(
      `Missing data in audit log middleware: userId: ${userId}, tableName: ${tableName}, actionType: ${actionType}, recordId: ${recordId}`
    );
  }

  // Continue to the next middleware or route handler
  next();
};

module.exports = auditLogMiddleware;
