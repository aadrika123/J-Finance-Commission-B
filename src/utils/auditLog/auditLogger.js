const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Creates an entry in the audit log.
 *
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action performed (e.g., 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} tableName - The name of the table where the action occurred.
 * @param {number|string} recordId - The ID of the record that was affected by the action. Converted to string if necessary.
 * @param {Object} changedData - The data that was changed during the action, stored as JSON.
 *
 * @returns {Promise<void>} - A promise that resolves when the audit log entry is created.
 */
const createAuditLog = async (
  user_id,
  action_type,
  table_name,
  record_id,
  changed_data
) => {
  try {
    // Create a new audit log entry in the database
    await prisma.audit_log.create({
      data: {
        user_id: user_id, // User ID performing the action
        action_type: action_type, // Type of action performed
        table_name: table_name, // Table where the action occurred
        record_id: String(record_id), // Ensure record_id is a string for consistency
        changed_data: changed_data, // Store the change data as JSON
      },
    });
    console.log("Audit log created successfully.");
  } catch (error) {
    // Log any errors that occur during the creation of the audit log
    console.error("Error creating audit log:", error);
  }
};

module.exports = createAuditLog;