const mongoose = require("mongoose");

const maisonHoteSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  codePostal: { type: String },
  pays: { type: String, default: "Tunisie" },
  latitude: { type: Number },
  longitude: { type: Number },
  photos: [{ type: String }],
  equipements: {
    jardin: { type: Boolean, default: false },
    piscine: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    climatisation: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
    navetteAeroport: { type: Boolean, default: false },
    chambresFamiliales: { type: Boolean, default: false },
    serviceEtage: { type: Boolean, default: false },
    nonFumeurs: { type: Boolean, default: false }
  },
  note: { type: Number, default: 0 },
  nombreAvis: { type: Number, default: 0 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MaisonHote", maisonHoteSchema);