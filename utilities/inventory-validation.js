const { body, validationResult } = require("express-validator")
const validate = {}

// Validation rules
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification must not contain spaces or special characters."),
  ]
}

// Middleware to check validation result
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      message: null,
    })
    return
  }
  next()
}

module.exports = validate
