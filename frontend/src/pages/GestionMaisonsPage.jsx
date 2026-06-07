import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Star, 
  Calendar,
  TrendingUp,
  Bed,
  ChevronRight,
  Settings,
  Users,
  Phone,
  Mail,
  Clock
} from "lucide-react";

export default function GestionMaisonsPage() {
  const [maisons, setMaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reservationsOwner, setReservationsOwner] = useState([]);
  const [stats, setStats] = useState({
    totalMaisons: 0,
    totalChambres: 0,
    totalReservations: 0,
    revenus: 0
  });
  const navigate = useNavigate();

  // Récupérer les réservations du propriétaire avec les infos client
  const fetchReservationsOwner = async () => {
    const token = localStorage.getItem("token");
    console.log("🔍 Récupération réservations owner...");
    
    try {
      const response = await fetch("http://localhost:5000/api/reservations/owner/reservations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log("📦 Réservations reçues:", data);
      
      setReservationsOwner(data);
      
      // Calcul des revenus
      const totalRevenus = data.reduce((sum, reservation) => {
        return sum + (reservation.prixTotal || 0);
      }, 0);
      
      setStats(prev => ({ 
        ...prev, 
        totalReservations: data.length,
        revenus: totalRevenus 
      }));
      
    } catch (error) {
      console.error("❌ Erreur réservations owner:", error);
    }
  };

  // Récupérer les chambres de toutes les maisons
  const fetchAllChambres = async (maisonsList) => {
    const token = localStorage.getItem("token");
    let totalChambres = 0;
    
    for (const maison of maisonsList) {
      try {
        const response = await fetch(`http://localhost:5000/api/chambres/maison/${maison._id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const chambres = await response.json();
        totalChambres += chambres.length;
      } catch (error) {
        console.error(`Erreur pour ${maison.nom}:`, error);
      }
    }
    
    return totalChambres;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "owner") {
      navigate("/login");
      return;
    }

    // Récupérer les maisons
    fetch('http://localhost:5000/api/maisons/owner/mes-maisons', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(async (data) => {
        setMaisons(data);
        const totalChambres = await fetchAllChambres(data);
        
        setStats(prev => ({
          ...prev,
          totalMaisons: data.length,
          totalChambres: totalChambres
        }));
        
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Erreur maisons:", err);
        setLoading(false);
      });

    // Récupérer les réservations
    fetchReservationsOwner();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette maison ?")) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/maisons/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMaisons(maisons.filter((m) => m._id !== id));
        alert("Maison supprimée avec succès");
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const renderStars = (note) => {
    const rating = Math.round(note || 0);
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatutClass = (statut) => {
    switch(statut) {
      case 'confirmée':
        return 'bg-green-100 text-green-700';
      case 'annulée':
        return 'bg-red-100 text-red-700';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatutText = (statut) => {
    switch(statut) {
      case 'confirmée':
        return '✓ Confirmée';
      case 'annulée':
        return '✗ Annulée';
      case 'en_attente':
        return '⏳ En attente';
      default:
        return statut;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex">

        {/* SIDEBAR */}
        <aside className="w-80 bg-white shadow-xl min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">DarHôtes</h2>
                <p className="text-sm text-gray-500">Espace Propriétaire</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Menu Principal</p>
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                  activeTab === "overview"
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <TrendingUp size={20} />
                <span className="font-medium">Vue d'ensemble</span>
              </button>
              <button
                onClick={() => setActiveTab("maisons")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                  activeTab === "maisons"
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Mes maisons</span>
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {stats.totalMaisons}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("reservations")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                  activeTab === "reservations"
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Calendar size={20} />
                <span className="font-medium">Réservations</span>
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {stats.totalReservations}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("parametres")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "parametres"
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Settings size={20} />
                <span className="font-medium">Paramètres</span>
              </button>
            </div>
          </nav>

          <div className="absolute bottom-0 w-80 p-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Besoin d'aide ?</p>
              <p className="text-xs text-gray-500 mb-3">Guide et support disponibles</p>
              <button className="text-yellow-600 text-sm font-medium hover:text-yellow-700 transition">
                Voir la documentation →
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1">

          {/* HEADER */}
          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "overview" && "Vue d'ensemble"}
                  {activeTab === "maisons" && "Mes maisons"}
                  {activeTab === "reservations" && "Réservations reçues"}
                  {activeTab === "parametres" && "Paramètres"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {activeTab === "overview" && "Bienvenue dans votre espace propriétaire"}
                  {activeTab === "maisons" && "Gérez vos maisons d'hôtes"}
                  {activeTab === "reservations" && "Consultez les réservations de vos clients"}
                  {activeTab === "parametres" && "Personnalisez votre espace"}
                </p>
              </div>
              <Link
                to="/ajouter-maison"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvelle maison
              </Link>
            </div>
          </div>

          <div className="p-8">
            
            {/* TAB OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-blue-500" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">{stats.totalMaisons}</span>
                    </div>
                    <p className="text-gray-600 font-medium">Maisons</p>
                    <p className="text-sm text-gray-400">Total de vos propriétés</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Bed className="w-6 h-6 text-green-500" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">{stats.totalChambres}</span>
                    </div>
                    <p className="text-gray-600 font-medium">Chambres</p>
                    <p className="text-sm text-gray-400">Capacité d'accueil</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-500" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">{stats.totalReservations}</span>
                    </div>
                    <p className="text-gray-600 font-medium">Réservations</p>
                    <p className="text-sm text-gray-400">Total reçues</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-500" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">{stats.revenus} DT</span>
                    </div>
                    <p className="text-gray-600 font-medium">Revenus</p>
                    <p className="text-sm text-gray-400">Total généré</p>
                  </div>
                </div>

                {/* Maisons récentes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Mes maisons récentes</h3>
                    <button
                      onClick={() => setActiveTab("maisons")}
                      className="text-yellow-600 text-sm font-medium hover:text-yellow-700 flex items-center gap-1"
                    >
                      Voir toutes
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {maisons.slice(0, 3).map((maison) => (
                      <div key={maison._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <img
                            src={maison.photos?.[0] || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"}
                            alt={maison.nom}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{maison.nom}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin size={12} className="text-gray-400" />
                              <p className="text-xs text-gray-500">{maison.ville}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/mes-maisons/${maison._id}/chambres`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Gérer les chambres"
                          >
                            <Bed size={18} className="text-green-500" />
                          </Link>
                          <Link
                            to={`/modifier-maison/${maison._id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Modifier la maison"
                          >
                            <Edit size={18} className="text-blue-500" />
                          </Link>
                          <button
                            onClick={() => handleDelete(maison._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Supprimer la maison"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB MAISONS */}
            {activeTab === "maisons" && (
              <div>
                {maisons.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Bienvenue dans votre espace</h3>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore de maison d'hôte</p>
                    <Link
                      to="/ajouter-maison"
                      className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition"
                    >
                      <Plus size={20} />
                      Ajouter votre première maison
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {maisons.map((maison) => (
                      <div
                        key={maison._id}
                        className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={maison.photos?.[0] || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"}
                            alt={maison.nom}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star size={12} className="fill-current" />
                            <span>{maison.note || 4.5}</span>
                          </div>
                          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <MapPin size={12} />
                            {maison.ville}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-500 transition">
                            {maison.nom}
                          </h3>
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                            {maison.description || "Aucune description"}
                          </p>
                          <div className="flex items-center gap-1 mb-4">
                            {renderStars(maison.note)}
                            <span className="text-xs text-gray-400 ml-2">({maison.note || 4.5})</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              to={`/mes-maisons/${maison._id}/chambres`}
                              className="flex-1 text-center bg-green-50 hover:bg-green-100 text-green-600 font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <Bed size={15} />
                              Chambres
                            </Link>
                            <Link
                              to={`/modifier-maison/${maison._id}`}
                              className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <Edit size={15} />
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(maison._id)}
                              className="flex-1 text-center bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <Trash2 size={15} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB RESERVATIONS - VERSION AMÉLIORÉE AVEC TOUTES LES INFOS */}
            {activeTab === "reservations" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">📅 Réservations reçues</h2>
                {reservationsOwner.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune réservation pour le moment</p>
                    <p className="text-sm text-gray-400 mt-2">Les réservations des clients apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservationsOwner.map((resa) => (
                      <div key={resa._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex flex-wrap justify-between gap-4">
                          
                          {/* Colonne gauche - Infos client et réservation */}
                          <div className="flex-1">
                            {/* Client info */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {resa.clientId?.firstName || resa.clientId?.name || "Client"} {resa.clientId?.lastName || ""}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail size={12} /> {resa.clientId?.email || "Email non disponible"}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone size={12} /> {resa.clientId?.phone || "Tél non renseigné"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Détails de la réservation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">🛏️ Chambre:</span> {resa.chambreId?.nom || "Chambre"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">🏠 Maison:</span> {resa.maisonId?.nom || "Maison"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">📍 Adresse:</span> {resa.maisonId?.adresse || ""}, {resa.maisonId?.ville || ""}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">📅 Dates:</span> {formatDate(resa.dateDebut)} → {formatDate(resa.dateFin)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">👤 Voyageurs:</span> {resa.nombreAdultes} adulte(s), {resa.nombreEnfants} enfant(s)
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">📅 Nuits:</span> {resa.nombreNuits}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">💰 Prix par nuit:</span> {resa.chambreId?.prix || 0} DT
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Colonne droite - Prix et statut */}
                          <div className="text-right min-w-[150px]">
                            <p className="text-3xl font-bold text-yellow-600">{resa.prixTotal} DT</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                              <Clock size={12} /> Réservé le {formatDate(resa.createdAt)}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatutClass(resa.statut)}`}>
                              {getStatutText(resa.statut)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB PARAMETRES */}
            {activeTab === "parametres" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres du compte</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
                    </div>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">Configurer</button>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Langue</p>
                      <p className="text-sm text-gray-500">Français</p>
                    </div>
                    <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Modifier</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}