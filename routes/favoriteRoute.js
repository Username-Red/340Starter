const express = require("express")
const router = new express.Router()
const favoriteController = require("../controllers/favoriteController")
const utilities = require("../utilities/") // assumes you have a login check middleware here

// Protect all routes with login check
router.use(utilities.checkLogin)

/* ======================
 * Route to view favorites
 * ====================== */
router.get("/", utilities.handleErrors(favoriteController.buildFavoritesView))

/* ======================
 * Route to add a favorite
 * ====================== */
router.post("/add", favoriteController.addFavorite)

/* ======================
 * Route to delete a favorite
 * ====================== */
router.post("/delete", favoriteController.deleteFavorite)

module.exports = router
