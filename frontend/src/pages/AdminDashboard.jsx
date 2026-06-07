import { useEffect, useState } from "react";
import { Users, Home, Bed, Calendar, Trash2, UserX, Building2, X } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [maisons, setMaisons] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  
  // État pour le modal de confirmation
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    id: null,
    nom: ""
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, maisonsRes, chambresRes, reservationsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/maisons", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/chambres", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/reservations", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setMaisons(await maisonsRes.json());
      setChambres(await chambresRes.json());
      setReservations(await reservationsRes.json());
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      let url = "";
      switch (modal.type) {
        case "client":
          url = `http://localhost:5000/api/admin/client/${modal.id}`;
          break;
        case "proprietaire":
          url = `http://localhost:5000/api/admin/proprietaire/${modal.id}`;
          break;
        case "maison":
          url = `http://localhost:5000/api/admin/maison/${modal.id}`;
          break;
        case "chambre":
          url = `http://localhost:5000/api/admin/chambre/${modal.id}`;
          break;
        case "reservation":
          url = `http://localhost:5000/api/admin/reservation/${modal.id}`;
          break;
      }
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert("✅ Supprimé avec succès !");
        fetchData(); // Recharger toutes les données
      } else {
        const data = await response.json();
        alert("❌ Erreur: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de la suppression");
    }
  };

  const openDeleteModal = (type, id, nom) => {
    setModal({ isOpen: true, type, id, nom });
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">📊 Dashboard Administrateur</h1>
        
        {/* Onglets */}
        <div className="flex gap-2 mb-8 border-b flex-wrap">
          <button onClick={() => setActiveTab("stats")} className={`px-4 py-2 font-medium ${activeTab === "stats" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-gray-500"}`}>
            📈 Statistiques
          </button>
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 font-medium ${activeTab === "users" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-gray-500"}`}>
            👥 Utilisateurs ({users.length})
          </button>
          <button onClick={() => setActiveTab("maisons")} className={`px-4 py-2 font-medium ${activeTab === "maisons" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-gray-500"}`}>
            🏠 Maisons ({maisons.length})
          </button>
          <button onClick={() => setActiveTab("chambres")} className={`px-4 py-2 font-medium ${activeTab === "chambres" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-gray-500"}`}>
            🛏️ Chambres ({chambres.length})
          </button>
          <button onClick={() => setActiveTab("reservations")} className={`px-4 py-2 font-medium ${activeTab === "reservations" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-gray-500"}`}>
            📅 Réservations ({reservations.length})
          </button>
        </div>
        
        {/* Statistiques */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Users size={32} className="text-blue-500" />
                <span className="text-2xl font-bold">{stats.users.total}</span>
              </div>
              <h3 className="font-semibold">Utilisateurs</h3>
              <p className="text-sm text-gray-500">👤 Clients: {stats.users.clients}</p>
              <p className="text-sm text-gray-500">🏢 Propriétaires: {stats.users.owners}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Home size={32} className="text-green-500" />
                <span className="text-2xl font-bold">{stats.maisons}</span>
              </div>
              <h3 className="font-semibold">Maisons</h3>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Bed size={32} className="text-purple-500" />
                <span className="text-2xl font-bold">{stats.chambres}</span>
              </div>
              <h3 className="font-semibold">Chambres</h3>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar size={32} className="text-yellow-500" />
                <span className="text-2xl font-bold">{stats.reservations}</span>
              </div>
              <h3 className="font-semibold">Réservations</h3>
            </div>
          </div>
        )}
        
        {/* Liste des utilisateurs */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" ? "bg-red-100 text-red-700" :
                        user.role === "owner" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {user.role === "admin" ? "Admin" : user.role === "owner" ? "Propriétaire" : "Client"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== "admin" && (
                        <button 
                          onClick={() => openDeleteModal(user.role === "client" ? "client" : "proprietaire", user._id, user.name)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Liste des maisons */}
        {activeTab === "maisons" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {maisons.map(maison => (
                  <tr key={maison._id}>
                    <td className="px-6 py-4">{maison.nom}</td>
                    <td className="px-6 py-4">{maison.ville}</td>
                    <td className="px-6 py-4">{maison.ownerId?.name || "Inconnu"}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openDeleteModal("maison", maison._id, maison.nom)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Liste des chambres */}
        {activeTab === "chambres" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chambres.map(chambre => (
                  <tr key={chambre._id}>
                    <td className="px-6 py-4">{chambre.nom}</td>
                    <td className="px-6 py-4">{chambre.maisonId?.nom || "Inconnu"}</td>
                    <td className="px-6 py-4">{chambre.prix} DT</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openDeleteModal("chambre", chambre._id, chambre.nom)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Liste des réservations */}
        {activeTab === "reservations" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map(reservation => (
                  <tr key={reservation._id}>
                    <td className="px-6 py-4">{reservation.clientId?.name || "Inconnu"}</td>
                    <td className="px-6 py-4">{reservation.chambreId?.nom || "Inconnu"}</td>
                    <td className="px-6 py-4">
                      {new Date(reservation.dateDebut).toLocaleDateString()} → {new Date(reservation.dateFin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{reservation.prixTotal} DT</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openDeleteModal("reservation", reservation._id, `Réservation ${reservation._id}`)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer "${modal.nom}" ?`}
        type="danger"
      />
    </div>
  );
}