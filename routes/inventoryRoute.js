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

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build the edit inventory item view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))


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
router.post("/update/", utilities.handleErrors(invController.updateInventory))

// Route to handle the deletion process
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventoryView))
router.post("/delete/", utilities.handleErrors(invController.deleteInventoryItem))

// Admin-only route to build inventory management view
router.get("/manage", utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView))

// Admin-only route to add classification
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))




module.exports = router
