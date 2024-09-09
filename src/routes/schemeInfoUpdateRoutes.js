const express = require("express");
const {
  modifySchemeInfo,
} = require("../controllers/schemeInfoUpdateController");

const router = express.Router();

// Update route for Scheme_info
router.put("/scheme-info/:scheme_id", modifySchemeInfo);

module.exports = router;
