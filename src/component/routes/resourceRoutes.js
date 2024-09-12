const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");

router.post("/resources", resourceController.createResource);
router.put("/resources/:id", resourceController.updateResource);
router.delete("/resources/:id", resourceController.deleteResource);

module.exports = router;
