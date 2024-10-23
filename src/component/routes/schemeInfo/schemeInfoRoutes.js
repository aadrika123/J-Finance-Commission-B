const express = require("express");
const {
  addSchemeInfo,
  fetchSchemeInfo,
  getSchemeInfoById,
  getSchemesInfoByULBName,
} = require("../../controllers/schemeInfo/schemeInfoController");
// const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

// POST route to add new scheme information
// This endpoint triggers the controller function to handle adding new scheme information
router.post(
  "/scheme-info",
  //  roleMiddleware(["SUDA FC"]),
  addSchemeInfo
);

// GET route to fetch paginated scheme information
// This endpoint triggers the controller function to retrieve scheme information
router.get(
  "/scheme-info",
  //  roleMiddleware(["EO FC"]),
  fetchSchemeInfo
);

// GET route to fetch scheme information by scheme_id
// This endpoint triggers the controller function to retrieve information of a specific scheme by its ID
router.get(
  "/scheme-info/view/:scheme_id",
  // roleMiddleware(["EO FC"]),
  getSchemeInfoById
);
router.get(
  "/scheme-info/show",
  // roleMiddleware(["SUDA FC"]),
  getSchemesInfoByULBName
);

module.exports = router;
