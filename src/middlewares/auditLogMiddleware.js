const createAuditLog = require("../utils/auditLog/auditLogger"); // Adjust the path as needed

const auditLogMiddleware = async (req, res, next) => {
  const userId = req.user ? req.user.id : null; // User ID from authentication
  const tableName = req.tableName; // Table name from route/controller
  const actionType = req.actionType; // Action type from route/controller

  // Log req.body and req.params to debug the issue
  console.log("req.body:", req.body);
  console.log("req.params:", req.params);

  // Ensure that req.params and req.body are defined before accessing 'id'
  const recordId = (req.params && req.params.id) || (req.body && req.body.id);

  if (!recordId) {
    console.log("Record ID is missing.");
  }

  if (userId && tableName && actionType && recordId) {
    const changedData = req.body || {}; // Data to be logged, defaults to empty object if req.body is undefined
    await createAuditLog(userId, actionType, tableName, recordId, changedData);
  } else {
    console.log(
      `Missing data in audit log middleware: userId: ${userId}, tableName: ${tableName}, actionType: ${actionType}, recordId: ${recordId}`
    );
  }

  next(); // Continue to the next middleware or route handler
};

module.exports = auditLogMiddleware;
