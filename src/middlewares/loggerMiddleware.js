const logger = require("../utils/logger");
const auditLogger = require("../utils/auditLogger");

const requestLogger = (req, res, next) => {
  const method = req.method;
  const httpVersion = req.httpVersion;
  const originUrl = req.originalUrl;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userId = req.user ? req.user.id : null; // Assuming user ID might be attached to req object

  // Log the request details using winston logger
  logger.info(
    `Method: ${method}, HTTP Version: ${httpVersion}, URL: ${originUrl}, IP: ${ipAddress}`
  );

  // Optionally create an audit log entry
  if (userId) {
    auditLogger
      .log(userId, "Request", `Method: ${method}, URL: ${originUrl}`, ipAddress)
      .catch((error) => {
        // Log error if the audit logger fails
        logger.error("Failed to create audit log:", error);
      });
  }

  next();
};

module.exports = requestLogger;
