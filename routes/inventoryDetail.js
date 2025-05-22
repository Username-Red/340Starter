const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

router.get("/detail/:invId", invController.buildDetailView);

module.exports = router;
