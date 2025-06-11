const pool = require("../database")

/* ***************************
 *  Add a new favorite
 * ************************** */
async function addFavorite(account_id, inventory_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)

      VALUES ($1, $2)
    `
    console.log("Adding favorite for account:", account_id, "inv_id:", inventory_id);

    const result = await pool.query(sql, [account_id, inventory_id])
    return result.rowCount
  } catch (error) {
    console.error("addFavorite error:", error)
    return null
  }

  
}

/* ***************************
 *  Get all favorites for an account
 * ************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, i.*
      FROM favorites AS f
      JOIN inventory AS i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getFavoritesByAccount error:", error)
    return []
  }
}

async function deleteFavorite(favorite_id) {
  try {
    console.log("Attempting to delete favorite with ID:", favorite_id)
    const sql = `DELETE FROM favorites WHERE favorite_id = $1`
    const result = await pool.query(sql, [favorite_id])
    console.log("Rows affected:", result.rowCount)
    return result.rowCount
  } catch (error) {
    console.error("deleteFavorite error:", error)
    return null
  }
}


module.exports = {
  addFavorite,
  getFavoritesByAccount,
  deleteFavorite,
}
