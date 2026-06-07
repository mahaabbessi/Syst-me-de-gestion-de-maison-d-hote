const mongoose = require("mongoose");

const maisonHoteSchema = new mongoose.Schema(
  {
    nom:{ 
        type: String, 
        required: [true, "Nom obligatoire"], trim: true },
    adresse:{ 
        type: String, 
        required: [true, "Adresse obligatoire"] },
    ville:{ 
        type: String,
         required: [true, "Ville obligatoire"] },
    description:{ 
        type: String, default: "" },
    photos:{ 
        type: [String], 
        default: [] },
    latitude:{ 
        type: Number, 
        default: null },
    longitude: { 
        type: Number, 
        default: null },
    ownerId:{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaisonHote", maisonHoteSchema);