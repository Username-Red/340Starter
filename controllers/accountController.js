const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()



/* ****************************************
*  Deliver login view
* **************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
  console.log("Login page accessed")
}

/* ****************************************
*  Deliver registration view
* **************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
  console.log("Register page accessed")
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const isMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (isMatch) {
      delete accountData.account_password

      // Create JWT
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h", // Correct syntax for 1 hour
      })

      // Set cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only secure in production
        maxAge: 3600000, // 1 hour in ms
      })

      req.session.loggedin = true
      req.session.firstname = accountData.account_firstname


      console.log("Login successful, redirecting to /account/")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Incorrect password. Please try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login Error:", error)
    req.flash("notice", "Login failed due to an unexpected error.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}



const buildAccount = async function (req, res) {
  console.log("Account Management View Reached")
  const nav = await utilities.getNav()
  const message = req.flash("notice")
  const accountData = res.locals.accountData 

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    message,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  })
}

async function buildAccountUpdate(req, res) {
  const account_id = res.locals.accountData.account_id;
  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    message: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });

}

/* ****************************************
 *  Process Account Update
 * ************************************ */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const nav = await utilities.getNav();

  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.");
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      message: req.flash("notice"),
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
    })

  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.redirect("/account/update");
  }
}

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
    } else {
      req.flash("notice", "Password update failed.");
    }

    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/management", {
      title: "Account Management",
      nav,
      message: req.flash("notice"),
      accountData,
    });
  } catch (error) {
    req.flash("notice", "There was an error updating the password.");
    res.redirect("/account/update");
  }
}

// Log out the user by clearing the JWT token cookie
async function logoutAccount(req, res) {
  res.clearCookie("jwt") // This removes the token
  req.session.loggedin = false
  return res.redirect("/") // Redirect to homepage
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logoutAccount,
}

