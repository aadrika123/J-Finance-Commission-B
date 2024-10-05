const express = require("express");
const {
  getULBs,
  getULBsAndSchemes,
  fetchULBInfoByCityType,
} = require("../../controllers/ulb/ulbController");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

// GET route to fetch all ULBs
// This endpoint triggers the controller function to retrieve a list of all Urban Local Bodies (ULBs)
router.get("/ulbs", roleMiddleware(["SUDA FC"]), getULBs);

// GET route to fetch ULBs along with their schemes
// This endpoint triggers the controller function to retrieve a list of all ULBs and their associated schemes
router.get("/ulbs-schemes", roleMiddleware(["SUDA FC"]), getULBsAndSchemes);

router.get("/ulb-info", roleMiddleware(["SUDA FC"]), fetchULBInfoByCityType);

module.exports = router;
