const Reservation = require("../models/Reservation");
const Chambre = require("../models/Chambre");
const MaisonHote = require("../models/MaisonHote");
const User = require("../models/user");
const { envoyerEmail } = require("../services/emailService");

const getClientName = (client) => {
  if (!client) return "Client";
  if (client.name) return client.name;
  if (client.email) return client.email.split('@')[0];
  return "Client";
};

const getClientFirstName = (client) => {
  if (!client) return "Cher client";
  if (client.name) return client.name.split(' ')[0];
  if (client.email) return client.email.split('@')[0];
  return "Cher client";
};

// ========== POST - Créer une réservation ==========
const createReservation = async (req, res) => {
  try {
    const { chambreId, dateDebut, dateFin, nombreAdultes, nombreEnfants } = req.body;
    const clientId = req.user.id;

    const chambre = await Chambre.findById(chambreId);
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée" });
    }

    const maison = await MaisonHote.findById(chambre.maisonId);
    if (!maison) {
      return res.status(404).json({ message: "Maison non trouvée" });
    }
    
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    
    const owner = await User.findById(maison.ownerId);

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    // ========== VÉRIFICATION DE DISPONIBILITÉ ==========
    const reservationsExistantes = await Reservation.find({
      chambreId: chambreId,
      statut: { $in: ["confirmée", "en_attente"] },
      $or: [
        { dateDebut: { $lte: debut, $gte: debut } },
        { dateFin: { $lte: fin, $gte: debut } },
        { dateDebut: { $gte: debut }, dateFin: { $lte: fin } },
        { dateDebut: { $lte: debut }, dateFin: { $gte: fin } }
      ]
    });

    if (reservationsExistantes.length > 0) {
      return res.status(409).json({ 
        message: "❌ Cette chambre n'est pas disponible pour les dates sélectionnées",
        conflits: reservationsExistantes.map(r => ({
          dateDebut: r.dateDebut,
          dateFin: r.dateFin
        }))
      });
    }
    // ========== FIN VÉRIFICATION ==========
    
    const nombreNuits = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
    const prixTotal = chambre.prix * nombreNuits;

    // Réservation directement confirmée
    const reservation = new Reservation({
      clientId,
      chambreId,
      maisonId: chambre.maisonId,
      dateDebut: debut,
      dateFin: fin,
      nombreNuits,
      nombreAdultes,
      nombreEnfants,
      prixTotal,
      statut: "confirmée"
    });

    await reservation.save();
    console.log(`✅ Réservation créée: ${reservation._id}`);

    // Email au client
    try {
      const clientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #eab308;">✅ Réservation confirmée !</h1>
          <p>Cher <strong>${getClientName(client)}</strong>,</p>
          <p>Votre réservation a été confirmée.</p>
          <hr>
          <p><strong>🏠 Maison :</strong> ${maison.nom}</p>
          <p><strong>🛏️ Chambre :</strong> ${chambre.nom}</p>
          <p><strong>📅 Dates :</strong> ${debut.toLocaleDateString('fr-FR')} → ${fin.toLocaleDateString('fr-FR')}</p>
          <p><strong>🌙 Nuits :</strong> ${nombreNuits}</p>
          <p><strong>💰 Total :</strong> ${prixTotal} DT</p>
          <hr>
          <p>L'équipe DarHôtes</p>
        </div>
      `;
      await envoyerEmail(client.email, "✅ Réservation confirmée - DarHôtes", clientHtml);
      console.log(`✅ Email envoyé au client: ${client.email}`);
    } catch (emailError) {
      console.error("⚠️ Email client non envoyé:", emailError.message);
    }

    // Email au propriétaire
    if (owner && owner.email) {
      try {
        const ownerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #eab308;">📅 Nouvelle réservation !</h1>
            <p>Bonjour <strong>${getClientFirstName(owner)}</strong>,</p>
            <p>Vous avez reçu une nouvelle réservation.</p>
            <hr>
            <p><strong>👤 Client :</strong> ${getClientName(client)}</p>
            <p><strong>📧 Email :</strong> ${client.email}</p>
            <p><strong>📞 Téléphone :</strong> ${client.phone || "Non renseigné"}</p>
            <hr>
            <p><strong>🏠 Maison :</strong> ${maison.nom}</p>
            <p><strong>🛏️ Chambre :</strong> ${chambre.nom}</p>
            <p><strong>📅 Dates :</strong> ${debut.toLocaleDateString('fr-FR')} → ${fin.toLocaleDateString('fr-FR')}</p>
            <p><strong>🌙 Nuits :</strong> ${nombreNuits}</p>
            <p><strong>💰 Total :</strong> ${prixTotal} DT</p>
            <hr>
            <p>Connectez-vous à votre espace propriétaire.</p>
            <p>L'équipe DarHôtes</p>
          </div>
        `;
        await envoyerEmail(owner.email, "📅 Nouvelle réservation - DarHôtes", ownerHtml);
        console.log(`✅ Email envoyé au propriétaire: ${owner.email}`);
      } catch (emailError) {
        console.error("⚠️ Email propriétaire non envoyé:", emailError.message);
      }
    }

    res.status(201).json({ message: "Réservation confirmée !", reservation });

  } catch (error) {
    console.error("Erreur createReservation:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== DELETE - Annuler une réservation ==========
const annulerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    if (reservation.clientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const reservationComplete = await Reservation.findById(req.params.id)
      .populate("clientId")
      .populate("chambreId")
      .populate("maisonId");

    await Reservation.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Réservation ${req.params.id} supprimée`);

    // Email d'annulation
    if (reservationComplete.clientId && reservationComplete.clientId.email) {
      try {
        const annulationHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">❌ Réservation annulée</h1>
            <p>Bonjour <strong>${getClientFirstName(reservationComplete.clientId)}</strong>,</p>
            <p>Votre réservation a bien été annulée.</p>
            <hr>
            <p><strong>🏠 Maison :</strong> ${reservationComplete.maisonId?.nom}</p>
            <p><strong>🛏️ Chambre :</strong> ${reservationComplete.chambreId?.nom}</p>
            <p><strong>📅 Dates :</strong> ${new Date(reservation.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(reservation.dateFin).toLocaleDateString('fr-FR')}</p>
            <hr>
            <p>L'équipe DarHôtes</p>
          </div>
        `;
        await envoyerEmail(reservationComplete.clientId.email, "❌ Réservation annulée - DarHôtes", annulationHtml);
        console.log(`✅ Email annulation envoyé à ${reservationComplete.clientId.email}`);
      } catch (emailError) {
        console.error("⚠️ Email annulation non envoyé:", emailError.message);
      }
    }

    res.status(200).json({ message: "Réservation annulée avec succès" });

  } catch (error) {
    console.error("Erreur annulerReservation:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== GET - Réservations du client ==========
const getMesReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ clientId: req.user.id })
      .populate("chambreId", "nom prix")
      .populate("maisonId", "nom adresse ville");
    console.log(`📦 ${reservations.length} réservation(s) pour le client`);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getMesReservations:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== GET - Réservations du propriétaire ==========
const getReservationsByOwner = async (req, res) => {
  try {
    console.log("🔍 Owner ID:", req.user.id);
    
    const maisons = await MaisonHote.find({ ownerId: req.user.id });
    console.log("🏠 Maisons trouvées:", maisons.length);
    
    if (maisons.length === 0) {
      return res.status(200).json([]);
    }
    
    const maisonIds = maisons.map(m => m._id);
    console.log("📦 IDs des maisons:", maisonIds);
    
    const reservations = await Reservation.find({ maisonId: { $in: maisonIds } })
      .populate("clientId", "name email phone")
      .populate("chambreId", "nom prix capacite")
      .populate("maisonId", "nom adresse ville photos");
    
    console.log(`📦 Réservations trouvées: ${reservations.length}`);
    
    const formattedReservations = reservations.map(reservation => {
      const obj = reservation.toObject();
      if (obj.clientId && obj.clientId.name) {
        const nameParts = obj.clientId.name.split(' ');
        obj.clientId.firstName = nameParts[0];
        obj.clientId.lastName = nameParts.slice(1).join(' ') || "";
      }
      return obj;
    });
    
    res.status(200).json(formattedReservations);
    
  } catch (error) {
    console.error("❌ Erreur getReservationsByOwner:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== GET - Toutes les réservations (Admin) ==========
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("clientId", "name email")
      .populate("chambreId", "nom prix")
      .populate("maisonId", "nom");
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReservation,
  annulerReservation,
  getMesReservations,
  getReservationsByOwner,
  getAllReservations
};