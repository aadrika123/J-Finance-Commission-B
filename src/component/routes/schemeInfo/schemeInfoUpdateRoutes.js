const express = require("express");
const {
  modifySchemeInfo,
} = require("../../controllers/schemeInfo/schemeInfoUpdateController");

const router = express.Router();

// Update route for Scheme_info
router.post("/scheme-info/update/:scheme_id", modifySchemeInfo);

module.exports = router;
