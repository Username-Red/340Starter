const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;
  const data = await invModel.getVehicleById(invId);
  const vehicleHtml = utilities.buildVehicleDetail(data);
  const nav = await utilities.getNav();

  res.render("inventory/vehicle-detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    vehicleHtml,
    errors: null,
  });
};

invCont.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  req.flash("notice", "You are viewing the inventory management page.") // Optional flash
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("notice"),
  })
}

/** Display form */
invCont.buildAddClassification = async (req, res) => {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("notice"),
  })
}

/** Handle form submission */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body
  const insertResult = await invModel.addNewClassification(classification_name)

  if (insertResult) {
    let nav = await utilities.getNav() // updated nav with new classification
    req.flash("notice", `Classification "${classification_name}" added.`)
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("notice"),
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "Failed to add classification.")
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash("notice"),
    })
  }
}

// View route handler
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    message: null,
    errors: null,
  })
}

// Post route handler
invCont.addInventory = async function (req, res) {
  const {
    classification_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  } = req.body

  const insertResult = await invModel.addInventoryItem(
    classification_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )

  if (insertResult) {
    req.flash("notice", `${inv_make} ${inv_model} added successfully.`)
    res.redirect("/inv")
  } else {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: "Sorry, the inventory item could not be added.",
      errors: null,
      inv_make, inv_model, inv_description, inv_image,
      inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    })
  }
}


module.exports = invCont;
