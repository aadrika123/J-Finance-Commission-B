const createAuditLog = require("../utils/auditLog/auditLogger"); // Adjust the path as needed

// Middleware for creating audit logs
const auditLogMiddleware = async (req, res, next) => {
  // Extract user ID from authentication data in request body, if available
  const user_id = req.user ? req.body?.auth.id : null;

  // Extract table name and action type from request or default to null
  const table_name = req.table_name || null;
  const action_type = req.action_type || null;

  // Extract record ID from request parameters or body
  const record_id =
    (req.params && req.params.id) || (req.body && req.body.id) || null;

  // Check if all required data is available
  if (user_id && table_name && action_type && record_id) {
    // Data to be logged
    const changed_data = req.body || {};

    try {
      // Create the audit log entry
      await createAuditLog(
        user_id,
        action_type,
        table_name,
        record_id,
        changed_data
      );
      console.log(
        `Audit log created for user_id: ${user_id}, table_name: ${table_name}, action_type: ${action_type}, record_id: ${record_id}`
      );
    } catch (error) {
      // Log any errors encountered during audit log creation
      console.error(`Failed to create audit log: ${error.message}`);
    }
  }
  // else {
  //   // Log a warning if any required data is missing
  //   console.warn(
  //     `Missing data in audit log middleware: user_id: ${user_id}, table_name: ${table_name}, action_type: ${action_type}, record_id: ${record_id}`
  //   );
  // }

  // Continue to the next middleware or route handler
  next();
};

module.exports = auditLogMiddleware;
