const express = require("express");
const {
  addSchemeInfo,
  fetchSchemeInfo,
} = require("../controllers/schemeInfoController");

const router = express.Router();

// POST route to add new scheme info
router.post("/scheme-info", addSchemeInfo);
router.get("/scheme-info", fetchSchemeInfo);

module.exports = router;
