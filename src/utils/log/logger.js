const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json(),
    format.prettyPrint(),
    format.printf((info) => {
      const baseLog = {
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        ...(info.ip && { ip: info.ip }), // Add IP if available
        ...(info.userId && { userId: info.userId }), // Add userId if available
        ...(info.action && { action: info.action }), // Add action if available
        ...(info.resultCount && { resultCount: info.resultCount }), // Add result count if available
      };
      return JSON.stringify(baseLog); // Return log as a single JSON string
    })
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "app.log"),
      level: "info",
      format: format.combine(format.json(), format.prettyPrint()),
    }),
    // new transports.Console({
    //   format: format.combine(format.colorize(), format.simple()),
    // }),
  ],
});

module.exports = logger;
