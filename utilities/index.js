const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

Util.buildVehicleDetail = function(vehicle, loggedin) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);

  const miles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles);

  let favoriteButton = "";

  if (loggedin) {
    favoriteButton = `
      <form action="/favorites/add" method="POST">
        <input type="hidden" name="inv_id" value="${vehicle.inv_id}">
        <button type="submit">❤️ Add to Favorites</button>
      </form>
    `;
  } else {
    favoriteButton = `<p><a href="/account/login">Log in</a> to add to favorites</p>`;
  }

  return `
    <section class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <h3>Price: ${price}</h3>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
      </div>
      ${favoriteButton}
    </section>
  `;
};



/* **************************************
 * Build classification dropdown <select>
 ************************************** */
Util.buildClassificationList = async function (selectedId = "") {
  let data = await invModel.getClassifications()
  let list =
    '<select name="classification_id" id="classificationList" required>'
  list += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}" ${
      selectedId == row.classification_id ? "selected" : ""
    }>${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


/* ****************************************
 * Middleware to check if user is Employee or Admin
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "Please log in to access that page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      req.user = decoded
      next()
    } else {
      req.flash("notice", "You do not have permission to access that page.")
      return res.redirect("/account/login")
    }
  } catch (err) {
    console.error("JWT verification failed:", err)
    req.flash("notice", "Invalid session. Please log in again.")
    return res.redirect("/account/login")
  }
}


module.exports = Util