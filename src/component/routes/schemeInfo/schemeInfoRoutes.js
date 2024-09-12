const express = require("express");
const {
  addSchemeInfo,
  fetchSchemeInfo,
  getSchemeInfoById,
} = require("../../controllers/schemeInfo/schemeInfoController");

const router = express.Router();

// POST route to add new scheme info
router.post("/scheme-info", addSchemeInfo);
router.get("/scheme-info", fetchSchemeInfo);
router.get("/scheme-info/view/:scheme_id", getSchemeInfoById);

module.exports = router;
