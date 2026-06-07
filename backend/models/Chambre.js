const mongoose = require("mongoose");

const chambreSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  capacite: { type: Number, required: true, default: 2 },
  prix: { type: Number, required: true },
  photos: [{ type: String }],
  maisonId: { type: mongoose.Schema.Types.ObjectId, ref: "MaisonHote", required: true },
  disponible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chambre", chambreSchema);