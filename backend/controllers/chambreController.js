const Chambre = require("../models/Chambre");
const MaisonHote = require("../models/MaisonHote");

// GET toutes les chambres d'une maison — public
const getChambresByMaison = async (req, res) => {
  try {
    const chambres = await Chambre.find({ maisonId: req.params.maisonId });
    res.status(200).json(chambres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET une chambre par ID — public
const getChambreById = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    if (!chambre) return res.status(404).json({ message: "Chambre introuvable" });
    res.status(200).json(chambre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST créer une chambre — owner uniquement
const createChambre = async (req, res) => {
  try {
    const maison = await MaisonHote.findById(req.params.maisonId);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    if (maison.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });

    const chambre = new Chambre({ ...req.body, maisonId: req.params.maisonId });
    const saved = await chambre.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT modifier une chambre — owner uniquement
const updateChambre = async (req, res) => {
  try {
    // SANS populate — chercher la chambre puis la maison séparément
    const chambre = await Chambre.findById(req.params.id);
    if (!chambre) return res.status(404).json({ message: "Chambre introuvable" });

    const maison = await MaisonHote.findById(chambre.maisonId);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    if (maison.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });

    const updated = await Chambre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE supprimer une chambre — owner uniquement
const deleteChambre = async (req, res) => {
  try {
    //  SANS populate — chercher la chambre puis la maison séparément
    const chambre = await Chambre.findById(req.params.id);
    if (!chambre) return res.status(404).json({ message: "Chambre introuvable" });

    const maison = await MaisonHote.findById(chambre.maisonId);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    if (maison.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });

    //  SUPPRIMER directement comme deleteMaison
    await Chambre.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Chambre supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChambresByMaison,
  getChambreById,
  createChambre,
  updateChambre,
  deleteChambre,
};