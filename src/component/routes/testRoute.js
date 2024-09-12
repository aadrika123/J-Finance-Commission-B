const express = require("express");
const router = express.Router();
const auditLogger = require("../../utils/auditLog/auditLogger");

// Test route to trigger audit logging
router.post("/test-audit", async (req, res) => {
  const userId = 2; // Use a test user ID
  const action = "This is second test action";
  const details = "This is a second test log entry";
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    await auditLogger.log(userId, action, details, ipAddress);
    res.send("Audit log test successful");
  } catch (error) {
    res.status(500).send("Error logging audit");
  }
});

module.exports = router;
