const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getChambresByMaison,
  getChambreById,
  createChambre,
  updateChambre,
  deleteChambre,
} = require("../controllers/chambreController");

// Routes publiques
router.get("/maison/:maisonId", getChambresByMaison);
router.get("/:id", getChambreById);

// Routes protégées (owner)
router.post("/maison/:maisonId", verifyToken, createChambre);
router.put("/:id", verifyToken, updateChambre);
router.delete("/:id", verifyToken, deleteChambre);

module.exports = router;