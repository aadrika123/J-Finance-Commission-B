const express = require("express");
const {
  getULBs,
  getULBsAndSchemes,
  fetchULBInfoByCityType,
} = require("../../controllers/ulb/ulbController");

const router = express.Router();

// GET route to fetch all ULBs
// This endpoint triggers the controller function to retrieve a list of all Urban Local Bodies (ULBs)
router.get("/ulbs", getULBs);

// GET route to fetch ULBs along with their schemes
// This endpoint triggers the controller function to retrieve a list of all ULBs and their associated schemes
router.get("/ulbs-schemes", getULBsAndSchemes);

router.get("/ulb-info", fetchULBInfoByCityType);

module.exports = router;
