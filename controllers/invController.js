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
  let classificationSelect = await utilities.buildClassificationList(classification_id)
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    classificationSelect,
    errors: null,
  });
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;
  const data = await invModel.getVehicleById(invId);
  const vehicleHtml = utilities.buildVehicleDetail(data, req.session.loggedin);
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
  let classificationSelect = await utilities.buildClassificationList()
  req.flash("notice", "You are viewing the inventory management page.") // Optional flash
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("notice"),
    classificationSelect
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id) // Step 1: get ID from URL

  let nav = await utilities.getNav() // Step 2: get nav bar
  const itemData = await invModel.getVehicleById(inv_id) // Step 3: get item data from DB
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id) // Step 4: select drop-down
  const itemName = `${itemData.inv_make} ${itemData.inv_model}` // Step 5: build display name

  // Step 6: send data to view
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect,
    message: "Welcome to the editor",
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

// Deliver the delete confirmation view
invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const name = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("inventory/delete-inventory", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  } catch (error) {
    next(error)
  }
}

// Process deletion of inventory item
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult) {
      req.flash("notice", "The vehicle was successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}


invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id) // Step 1: get ID from URL

  let nav = await utilities.getNav() // Step 2: get nav bar
  const itemData = await invModel.getVehicleById(inv_id) // Step 3: get item data from DB
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id) // Step 4: select drop-down
  const itemName = `${itemData.inv_make} ${itemData.inv_model}` // Step 5: build display name

  // Step 6: send data to view
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect,
    message: "Welcome to the editor",
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

invCont.getDeleteInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);

  try {
    const itemData = await invModel.getVehicleById(inv_id) // This must return one vehicle

    console.log("Fetched itemData:", itemData); // Add this

    if (!itemData) {
      req.flash("error", "Vehicle not found");
      return res.redirect("/inv");
    }

    res.render("inventory/delete-inventory", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
      message: req.flash("message")
    });

  } catch (err) {
    console.error("Error loading delete page:", err);
    res.status(500).send("Server error");
  }
};


module.exports = invCont;
