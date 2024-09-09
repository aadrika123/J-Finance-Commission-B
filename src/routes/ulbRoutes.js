const express = require("express");
const { getULBs } = require("../controllers/ulbController");

const router = express.Router();

router.get("/ulbs", getULBs);

module.exports = router;
