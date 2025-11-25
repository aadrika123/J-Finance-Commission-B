const express = require("express");
const {
  modifySchemeInfo,
  updateScheme
} = require("../../controllers/schemeInfo/schemeInfoUpdateController");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

// POST route to update scheme information by scheme_id
// This endpoint triggers the controller function to handle updating the information of a specific scheme identified by scheme_id
router.post(
  "/scheme-info/update/:scheme_id",
  // roleMiddleware(["EO FC"]),
  modifySchemeInfo
);
// Route to update scheme info
router.post('/scheme/:scheme_id',
  // roleMiddleware(["SUDA FC"]),
   updateScheme);

module.exports = router;
//
