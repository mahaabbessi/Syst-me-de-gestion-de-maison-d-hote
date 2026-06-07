const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin"); // Utiliser votre middleware existant
const {
  supprimerClient,
  supprimerProprietaire,
  supprimerMaison,
  supprimerChambre,
  supprimerReservation,
  getStats,
  getAllUsers,
  getAllMaisons,
  getAllChambres,
  getAllReservations
} = require("../controllers/adminController");

// Toutes les routes nécessitent authentification + admin
router.use(verifyToken);
router.use(isAdmin); // Utiliser isAdmin au lieu de verifyAdmin

// Statistiques
router.get("/stats", getStats);

// Listes
router.get("/users", getAllUsers);
router.get("/maisons", getAllMaisons);
router.get("/chambres", getAllChambres);
router.get("/reservations", getAllReservations);

// Suppressions
router.delete("/client/:id", supprimerClient);
router.delete("/proprietaire/:id", supprimerProprietaire);
router.delete("/maison/:id", supprimerMaison);
router.delete("/chambre/:id", supprimerChambre);
router.delete("/reservation/:id", supprimerReservation);

module.exports = router;