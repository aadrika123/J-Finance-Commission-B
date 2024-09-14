const express = require("express");
const {
  getULBs,
  getULBsAndSchemes,
} = require("../../controllers/ulb/ulbController");

const router = express.Router();

router.get("/ulbs", getULBs);
router.get("/ulbs-schemes", getULBsAndSchemes);

module.exports = router;
