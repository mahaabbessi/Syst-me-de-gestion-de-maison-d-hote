import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Trash2, X, CheckCircle } from "lucide-react";

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationAnnulation, setConfirmationAnnulation] = useState(null);

  const fetchReservations = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "client") {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reservations/mes-reservations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error("Erreur chargement");
      }
      
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const annulerReservation = async (id) => {
    if (!window.confirm("Annuler cette réservation ?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const reservationAnnulee = reservations.find(r => r._id === id);
        
        setConfirmationAnnulation({
          id: id,
          nomChambre: reservationAnnulee?.chambreId?.nom || "Chambre",
          dates: {
            debut: reservationAnnulee?.dateDebut,
            fin: reservationAnnulee?.dateFin
          }
        });
        
        await fetchReservations();
        
        setTimeout(() => {
          setConfirmationAnnulation(null);
        }, 5000);
      } else {
        alert("Erreur lors de l'annulation");
      }
    } catch (error) {
      alert("Erreur lors de l'annulation");
    }
  };

  const fermerConfirmation = () => {
    setConfirmationAnnulation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement de vos réservations...</p>
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
                <p className="font-semibold text-green-800">✓ Réservation annulée</p>
                <p className="text-sm text-green-600">
                  {confirmationAnnulation.nomChambre} · 
                  {confirmationAnnulation.dates.debut && new Date(confirmationAnnulation.dates.debut).toLocaleDateString('fr-FR')} → 
                  {confirmationAnnulation.dates.fin && new Date(confirmationAnnulation.dates.fin).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <button onClick={fermerConfirmation} className="text-green-600 hover:text-green-800">
              <X size={18} />
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">📅 Mes réservations</h1>
        
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Vous n'avez aucune réservation</p>
            <Link to="/maisons" className="text-yellow-500 mt-2 inline-block hover:underline">
              Découvrir nos maisons →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((resa) => (
              <div key={resa._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{resa.chambreId?.nom || "Chambre"}</h3>
                    <p className="text-gray-500 text-sm">{resa.maisonId?.nom || "Maison"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {new Date(resa.dateDebut).toLocaleDateString('fr-FR')} → {new Date(resa.dateFin).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      👤 {resa.nombreAdultes} adulte(s) {resa.nombreEnfants > 0 ? `+ ${resa.nombreEnfants} enfant(s)` : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      📍 {resa.maisonId?.adresse}, {resa.maisonId?.ville}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{resa.prixTotal} DT</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {resa.nombreNuits} nuit(s)
                    </p>
                    {/* Bouton Annuler en ROUGE */}
                    <button 
                      onClick={() => annulerReservation(resa._id)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition mt-3 flex items-center gap-2 ml-auto"
                    >
                      <Trash2 size={16} /> Annuler
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideInFromTop 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}