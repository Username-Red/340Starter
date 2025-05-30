// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/") 
const invValidate = require("../utilities/inventory-validation")






// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route for detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView))

router.get("/", invController.buildManagementView)

// GET route to show the form
router.get("/add-classification", invController.buildAddClassification)

// POST route to handle the form
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.addInventory)


module.exports = router
