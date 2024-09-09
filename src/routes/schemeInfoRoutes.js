const express = require("express");
const { addSchemeInfo } = require("../controllers/schemeInfoController");

const router = express.Router();

// POST route to add new scheme info
router.post("/scheme-info", addSchemeInfo);

module.exports = router;
