const favoriteModel = require("../models/favorite-model")
const utilities = require("../utilities")

/* ****************************************
 *  Display all favorites for logged-in user
 * **************************************** */
async function buildFavoritesView(req, res, next) {
  try {
    const account_id = req.session.account_id
    

    //const accountId = req.session?.account_id;
    console.log("THE USER ID IS" + account_id)
    

    if (!account_id) {
      console.error("No account_id found in session.");
      res.redirect("/account/login"); // or show an error page
      return;
    }

    // const account_id = res.locals.accountData.account_id
    
    const favorites = await favoriteModel.getFavoritesByAccount(account_id)
    const nav = await utilities.getNav()

    res.render("favorites", {
      title: "Your Favorite Vehicles",
      nav,
      favorites,
      errors: null,
    })
  } catch (error) {
    console.error("buildFavoritesView error:", error)
    next(error)
  }
}

/* ****************************************
 *  Add a favorite vehicle
 * **************************************** */
async function addFavorite(req, res) {
  const {inv_id } = req.body
  const account_id = req.session.account_id

  try {
    const result = await favoriteModel.addFavorite(account_id, inv_id)

    if (result > 0) {
      req.flash("notice", "Favorite added successfully!")
    } else {
      req.flash("notice", "Failed to add favorite.")
    }

    res.redirect("/favorites")
  } catch (error) {
    console.error("addFavorite error:", error)
    req.flash("notice", "An error occurred while adding the favorite.")
    res.redirect("/favorites")
  }
}

/* ****************************************
 *  Delete a favorite vehicle
 * **************************************** */
async function deleteFavorite(req, res) {
  const { favorite_id } = req.body; // or req.params if using route params
  console.log("THE FAVORITE_ID IS " + favorite_id);

  const id = parseInt(favorite_id);
  req.flash("notice", "Favorite ID: " + 3 + id);
  if (isNaN(id)) {
    req.flash("notice", "Invalid favorite ID. " + favorite_id);
    return res.redirect("/favorites");
  }

  try {
    const result = await favoriteModel.deleteFavorite(id);
    
    if (result > 0) {
      req.flash("notice", "Favorite removed.");
    } else {
      req.flash("notice", "Could not remove favorite.");
    }

    res.redirect("/favorites");
  } catch (error) {
    console.error("deleteFavorite error:", error);
    req.flash("notice", "An error occurred while removing the favorite.");
    res.redirect("/favorites");
  }
}


module.exports = {
  buildFavoritesView,
  addFavorite,
  deleteFavorite,
}
