const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
    getAllMaisons,
    getMaisonById,
    getMesMaisons,
    createMaison,
    updateMaison,
    deleteMaison
} = require("../controllers/maisonController");

// Routes publiques
router.get("/", getAllMaisons);
router.get("/:id", getMaisonById);

// Routes protégées
router.get("/owner/mes-maisons", verifyToken, getMesMaisons);
router.post("/", verifyToken, createMaison);
router.put("/:id", verifyToken, updateMaison);
router.delete("/:id", verifyToken, deleteMaison);

module.exports = router;