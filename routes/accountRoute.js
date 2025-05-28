// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/") 

// Route to build main account view (e.g., "My Account" page)
router.get("/", utilities.handleErrors(accountController.buildAccount))

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Route to process the registration data
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
