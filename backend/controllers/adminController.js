const User = require("../models/user");
const MaisonHote = require("../models/MaisonHote");
const Chambre = require("../models/Chambre");
const Reservation = require("../models/Reservation");

// ========== STATISTIQUES GLOBALES ==========
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalMaisons = await MaisonHote.countDocuments();
    const totalChambres = await Chambre.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    
    res.status(200).json({
      users: {
        total: totalUsers,
        clients: totalClients,
        owners: totalOwners,
        admins: totalAdmins
      },
      maisons: totalMaisons,
      chambres: totalChambres,
      reservations: totalReservations
    });
    
  } catch (error) {
    console.error("Erreur getStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== LISTER TOUS LES UTILISATEURS ==========
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur getAllUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== LISTER TOUTES LES MAISONS ==========
const getAllMaisons = async (req, res) => {
  try {
    const maisons = await MaisonHote.find().populate("ownerId", "name email");
    res.status(200).json(maisons);
  } catch (error) {
    console.error("Erreur getAllMaisons:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== LISTER TOUTES LES CHAMBRES ==========
const getAllChambres = async (req, res) => {
  try {
    const chambres = await Chambre.find().populate("maisonId", "nom");
    res.status(200).json(chambres);
  } catch (error) {
    console.error("Erreur getAllChambres:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== LISTER TOUTES LES RÉSERVATIONS ==========
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("clientId", "name email")
      .populate("chambreId", "nom prix")
      .populate("maisonId", "nom");
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getAllReservations:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== SUPPRIMER UN CLIENT (ET SES RÉSERVATIONS) ==========
const supprimerClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await User.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    
    if (client.role !== "client") {
      return res.status(400).json({ message: "Cet utilisateur n'est pas un client" });
    }
    
    // Supprimer toutes les réservations du client
    const reservationsSupprimees = await Reservation.deleteMany({ clientId: id });
    console.log(`✅ ${reservationsSupprimees.deletedCount} réservations supprimées`);
    
    // Supprimer le client
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Client supprimé avec succès",
      reservationsSupprimees: reservationsSupprimees.deletedCount
    });
    
  } catch (error) {
    console.error("Erreur supprimerClient:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== SUPPRIMER UN PROPRIÉTAIRE (ET SES MAISONS, CHAMBRES, RÉSERVATIONS) ==========
const supprimerProprietaire = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proprietaire = await User.findById(id);
    if (!proprietaire) {
      return res.status(404).json({ message: "Propriétaire non trouvé" });
    }
    
    if (proprietaire.role !== "owner") {
      return res.status(400).json({ message: "Cet utilisateur n'est pas un propriétaire" });
    }
    
    // Récupérer toutes les maisons du propriétaire
    const maisons = await MaisonHote.find({ ownerId: id });
    
    let totalChambres = 0;
    let totalReservations = 0;
    
    for (const maison of maisons) {
      // Récupérer les chambres de chaque maison
      const chambres = await Chambre.find({ maisonId: maison._id });
      totalChambres += chambres.length;
      
      // Supprimer les réservations liées à chaque chambre
      for (const chambre of chambres) {
        const reservations = await Reservation.deleteMany({ chambreId: chambre._id });
        totalReservations += reservations.deletedCount;
      }
      
      // Supprimer les chambres de la maison
      await Chambre.deleteMany({ maisonId: maison._id });
      
      // Supprimer les réservations liées directement à la maison
      const resaMaison = await Reservation.deleteMany({ maisonId: maison._id });
      totalReservations += resaMaison.deletedCount;
    }
    
    // Supprimer toutes les maisons du propriétaire
    await MaisonHote.deleteMany({ ownerId: id });
    
    // Supprimer le propriétaire
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Propriétaire supprimé avec succès",
      maisonsSupprimees: maisons.length,
      chambresSupprimees: totalChambres,
      reservationsSupprimees: totalReservations
    });
    
  } catch (error) {
    console.error("Erreur supprimerProprietaire:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== SUPPRIMER UNE MAISON (ET SES CHAMBRES ET RÉSERVATIONS) ==========
const supprimerMaison = async (req, res) => {
  try {
    const { id } = req.params;
    
    const maison = await MaisonHote.findById(id);
    if (!maison) {
      return res.status(404).json({ message: "Maison non trouvée" });
    }
    
    // Récupérer les chambres de la maison
    const chambres = await Chambre.find({ maisonId: id });
    
    let totalReservations = 0;
    
    // Supprimer les réservations liées à chaque chambre
    for (const chambre of chambres) {
      const reservations = await Reservation.deleteMany({ chambreId: chambre._id });
      totalReservations += reservations.deletedCount;
    }
    
    // Supprimer les réservations liées directement à la maison
    const resaMaison = await Reservation.deleteMany({ maisonId: id });
    totalReservations += resaMaison.deletedCount;
    
    // Supprimer les chambres
    await Chambre.deleteMany({ maisonId: id });
    
    // Supprimer la maison
    await MaisonHote.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Maison supprimée avec succès",
      chambresSupprimees: chambres.length,
      reservationsSupprimees: totalReservations
    });
    
  } catch (error) {
    console.error("Erreur supprimerMaison:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== SUPPRIMER UNE CHAMBRE (ET SES RÉSERVATIONS) ==========
const supprimerChambre = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée" });
    }
    
    // Supprimer les réservations liées à cette chambre
    const reservations = await Reservation.deleteMany({ chambreId: id });
    
    // Supprimer la chambre
    await Chambre.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Chambre supprimée avec succès",
      reservationsSupprimees: reservations.deletedCount
    });
    
  } catch (error) {
    console.error("Erreur supprimerChambre:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== SUPPRIMER UNE RÉSERVATION ==========
const supprimerReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    
    await Reservation.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Réservation supprimée avec succès" });
    
  } catch (error) {
    console.error("Erreur supprimerReservation:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};