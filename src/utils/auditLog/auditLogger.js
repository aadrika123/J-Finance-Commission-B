const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAuditLog = async (
  userId,
  actionType,
  tableName,
  recordId,
  changedData
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId,
        actionType: actionType,
        tableName: tableName,
        recordId: String(recordId), // Ensure recordId is a string
        changedData: changedData, // Store the change data as JSON
      },
    });
    console.log("Audit log created successfully.");
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};

module.exports = createAuditLog;
