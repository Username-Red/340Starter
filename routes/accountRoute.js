// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/") 

// Route to build main account view (e.g., "My Account" page)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

router.get("/logout", accountController.logoutAccount)


// Route to process the registration data
// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)


router.post("/logout", accountController.logoutAccount)


module.exports = router
