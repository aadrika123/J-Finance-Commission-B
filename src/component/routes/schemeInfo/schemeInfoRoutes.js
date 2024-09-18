const express = require("express");
const {
  addSchemeInfo,
  fetchSchemeInfo,
  getSchemeInfoById,
} = require("../../controllers/schemeInfo/schemeInfoController");

const router = express.Router();

// POST route to add new scheme information
// This endpoint triggers the controller function to handle adding new scheme information
router.post("/scheme-info", addSchemeInfo);

// GET route to fetch paginated scheme information
// This endpoint triggers the controller function to retrieve scheme information
router.get("/scheme-info", fetchSchemeInfo);

// GET route to fetch scheme information by scheme_id
// This endpoint triggers the controller function to retrieve information of a specific scheme by its ID
router.get("/scheme-info/view/:scheme_id", getSchemeInfoById);

module.exports = router;
