const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const auditLogger = {
  log: async (userId, action, details = "", ipAddress = "") => {
    try {
      await prisma.auditLog.create({
        data: {
          userId: typeof userId === "number" ? userId : 0, // Use 0 if userId is not a number
          action,
          details,
          ipAddress,
        },
      });
      console.log("Audit log created");
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  },
};

module.exports = auditLogger;
