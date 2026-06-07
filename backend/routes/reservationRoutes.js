const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  createReservation,
  getMesReservations,
  getReservationsByOwner,
  annulerReservation,
  getAllReservations
} = require("../controllers/reservationController");

// Routes publiques
router.get("/", getAllReservations);

// Routes client
router.post("/", verifyToken, createReservation);
router.get("/mes-reservations", verifyToken, getMesReservations);

// Route propriétaire
router.get("/owner/reservations", verifyToken, getReservationsByOwner);

// Route avec paramètre
router.delete("/:id", verifyToken, annulerReservation);

module.exports = router;