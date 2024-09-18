const createAuditLog = require("../utils/auditLog/auditLogger"); // Adjust the path as needed

const auditLogMiddleware = async (req, res, next) => {
  const userId = req.user ? req.body?.auth.id : null; // User ID from authentication
  const tableName = req.tableName || null; // Table name from route/controller, default to null
  const actionType = req.actionType || null; // Action type from route/controller, default to null

  // Ensure req.params and req.body are defined
  const recordId =
    (req.params && req.params.id) || (req.body && req.body.id) || null; // Record ID from params or body, default to null

  if (userId && tableName && actionType && recordId) {
    const changedData = req.body || {}; // Data to be logged, default to empty object
    try {
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
      console.error(`Failed to create audit log: ${error.message}`);
    }
    // } else {
    //   // Log missing data for debugging
    //   console.warn(
    //     `Missing data in audit log middleware: userId: ${userId}, tableName: ${tableName}, actionType: ${actionType}, recordId: ${recordId}`
    //   );
  }

  next(); // Continue to the next middleware or route handler
};

module.exports = auditLogMiddleware;
