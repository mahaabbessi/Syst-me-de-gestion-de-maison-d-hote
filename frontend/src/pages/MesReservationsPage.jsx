import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Trash2, X, CheckCircle } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://gestion-maison-hote-backend.onrender.com"
).replace(/\/+$/, "");

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationAnnulation, setConfirmationAnnulation] =
    useState(null);

  const fetchReservations = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "client") {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/reservations/mes-reservations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status réservations :", response.status);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des réservations");
      }

      const data = await response.json();

      console.log("Réservations client reçues :", data);

      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement réservations :", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const annulerReservation = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );

    if (!confirmation) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Status annulation :", response.status);

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation");
      }

      const reservationAnnulee = reservations.find(
        (reservation) => reservation._id === id
      );

      setConfirmationAnnulation({
        id,
        nomChambre: reservationAnnulee?.chambreId?.nom || "Chambre",
        dates: {
          debut: reservationAnnulee?.dateDebut,
          fin: reservationAnnulee?.dateFin,
        },
      });

      await fetchReservations();

      setTimeout(() => {
        setConfirmationAnnulation(null);
      }, 5000);
    } catch (error) {
      console.error("Erreur annulation :", error);
      alert("Erreur lors de l'annulation de la réservation.");
    }
  };

  const fermerConfirmation = () => {
    setConfirmationAnnulation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>

        <p className="text-gray-500">
          Chargement de vos réservations...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {confirmationAnnulation && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>

              <div>
                <p className="font-semibold text-green-800">
                  Réservation annulée
                </p>

                <p className="text-sm text-green-600">
                  {confirmationAnnulation.nomChambre} ·{" "}
                  {confirmationAnnulation.dates.debut &&
                    new Date(
                      confirmationAnnulation.dates.debut
                    ).toLocaleDateString("fr-FR")}{" "}
                  →{" "}
                  {confirmationAnnulation.dates.fin &&
                    new Date(
                      confirmationAnnulation.dates.fin
                    ).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <button
              onClick={fermerConfirmation}
              className="text-green-600 hover:text-green-800"
              aria-label="Fermer la confirmation"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">
          📅 Mes réservations
        </h1>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar
              size={48}
              className="text-gray-300 mx-auto mb-4"
            />

            <p className="text-gray-500">
              Vous n'avez aucune réservation
            </p>

            <Link
              to="/maisons"
              className="text-yellow-500 mt-2 inline-block hover:underline"
            >
              Découvrir nos maisons →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {reservation.chambreId?.nom || "Chambre"}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {reservation.maisonId?.nom || "Maison"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      📅{" "}
                      {reservation.dateDebut &&
                        new Date(
                          reservation.dateDebut
                        ).toLocaleDateString("fr-FR")}{" "}
                      →{" "}
                      {reservation.dateFin &&
                        new Date(
                          reservation.dateFin
                        ).toLocaleDateString("fr-FR")}
                    </p>

                    <p className="text-sm text-gray-500">
                      👤 {reservation.nombreAdultes || 0} adulte(s){" "}
                      {reservation.nombreEnfants > 0
                        ? `+ ${reservation.nombreEnfants} enfant(s)`
                        : ""}
                    </p>

                    <p className="text-sm text-gray-500">
                      📍 {reservation.maisonId?.adresse || ""},{" "}
                      {reservation.maisonId?.ville || ""}
                    </p>

                    <p className="text-sm mt-2">
                      Statut :{" "}
                      <span className="font-semibold text-yellow-600">
                        {reservation.statut ||
                          reservation.status ||
                          "En cours"}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">
                      {reservation.prixTotal || 0} DT
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {reservation.nombreNuits || 0} nuit(s)
                    </p>

                    <button
                      onClick={() =>
                        annulerReservation(reservation._id)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition mt-3 flex items-center gap-2 ml-auto"
                    >
                      <Trash2 size={16} />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
