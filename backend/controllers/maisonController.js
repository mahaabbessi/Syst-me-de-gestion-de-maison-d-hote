const MaisonHote = require("../models/MaisonHote");

const getAllMaisons = async (req, res) => {
  try {
    const maisons = await MaisonHote.find();
    res.status(200).json(maisons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaisonById = async (req, res) => {
  try {
    const maison = await MaisonHote.findById(req.params.id);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    res.status(200).json(maison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMesMaisons = async (req, res) => {
  try {
    const maisons = await MaisonHote.find({ ownerId: req.user.id });
    res.status(200).json(maisons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMaison = async (req, res) => {
  try {
    const maison = new MaisonHote({ ...req.body, ownerId: req.user.id });
    const saved = await maison.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMaison = async (req, res) => {
  try {
    const maison = await MaisonHote.findById(req.params.id);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    if (maison.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });

    const updated = await MaisonHote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMaison = async (req, res) => {
  try {
    const maison = await MaisonHote.findById(req.params.id);
    if (!maison) return res.status(404).json({ message: "Maison introuvable" });
    if (maison.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });

    await MaisonHote.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Maison supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMaisons,
  getMaisonById,
  getMesMaisons,
  createMaison,
  updateMaison,
  deleteMaison,
};