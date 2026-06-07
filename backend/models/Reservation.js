const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chambreId: { type: mongoose.Schema.Types.ObjectId, ref: "Chambre", required: true },
  maisonId: { type: mongoose.Schema.Types.ObjectId, ref: "MaisonHote", required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  nombreNuits: { type: Number, required: true },
  nombreAdultes: { type: Number, default: 1 },
  nombreEnfants: { type: Number, default: 0 },
  prixTotal: { type: Number, required: true },
  statut: { type: String, enum: ["confirmée", "annulée", "en_attente"], default: "confirmée" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reservation", reservationSchema);