const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


async function getVehicleById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getVehicleById error", error);
    throw error;
  }
}

async function addNewClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    await pool.query(sql, [classification_name])
    return true
  } catch (error) {
    console.error("addNewClassification error:", error)
    return false
  }
}


/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventoryItem(
  classification_id, make, model, description, image, thumbnail, price, year, miles, color
) {
  try {
    const sql = `INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
    const data = await pool.query(sql, [classification_id, make, model, description, image, thumbnail, price, year, miles, color])
    return data.rowCount
  } catch (error) {
    console.error("addInventoryItem error:", error)
    return null
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addNewClassification,
  addInventoryItem
}