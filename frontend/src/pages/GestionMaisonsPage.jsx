
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
  Clock,
} from "lucide-react";

// URL du backend Render
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://gestion-maison-hote-backend.onrender.com"
).replace(/\/+$/, "");

export default function GestionMaisonsPage() {
  const [maisons, setMaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reservationsOwner, setReservationsOwner] = useState([]);

  const [stats, setStats] = useState({
    totalMaisons: 0,
    totalChambres: 0,
    totalReservations: 0,
    revenus: 0,
  });

  const navigate = useNavigate();

  // Récupérer le token
  const getToken = () => localStorage.getItem("token");

  // Headers pour les requêtes authentifiées
  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // Vérifier les réponses du backend
  const parseResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Erreur serveur : ${response.status}`
      );
    }

    return data;
  };

  // Récupérer les réservations du propriétaire
  const fetchReservationsOwner = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/reservations/owner/reservations`,
        {
          headers: getHeaders(),
        }
      );

      const data = await parseResponse(response);

      console.log("Réservations reçues :", data);

      setReservationsOwner(Array.isArray(data) ? data : []);

      const totalRevenus = (Array.isArray(data) ? data : []).reduce(
        (sum, reservation) => sum + (reservation.prixTotal || 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        totalReservations: Array.isArray(data) ? data.length : 0,
        revenus: totalRevenus,
      }));
    } catch (error) {
      console.error("Erreur réservations owner :", error);
      setReservationsOwner([]);
    }
  };

  // Récupérer les chambres de toutes les maisons
  const fetchAllChambres = async (maisonsList) => {
    let totalChambres = 0;

    for (const maison of maisonsList) {
      try {
        const response = await fetch(
          `${API_URL}/api/chambres/maison/${maison._id}`,
          {
            headers: getHeaders(),
          }
        );

        const chambres = await parseResponse(response);

        if (Array.isArray(chambres)) {
          totalChambres += chambres.length;
        }
      } catch (error) {
        console.error(
          `Erreur chambres pour ${maison.nom} :`,
          error
        );
      }
    }

    return totalChambres;
  };

  // Récupérer les maisons du propriétaire connecté
  const fetchMaisonsOwner = async () => {
    try {
      console.log("URL utilisée :", API_URL);
      console.log("Récupération des maisons owner...");

      const response = await fetch(
        `${API_URL}/api/maisons/owner/mes-maisons`,
        {
          headers: getHeaders(),
        }
      );

      const data = await parseResponse(response);

      console.log("Maisons reçues :", data);

      const maisonsList = Array.isArray(data) ? data : [];

      setMaisons(maisonsList);

      const totalChambres = await fetchAllChambres(maisonsList);

      setStats((prev) => ({
        ...prev,
        totalMaisons: maisonsList.length,
        totalChambres,
      }));
    } catch (error) {
      console.error("Erreur maisons :", error);
      setMaisons([]);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem("role");

    if (!token || role !== "owner") {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchMaisonsOwner(),
        fetchReservationsOwner(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  // Supprimer une maison
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette maison ?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/maisons/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await parseResponse(response);

      setMaisons((prev) => prev.filter((m) => m._id !== id));

      setStats((prev) => ({
        ...prev,
        totalMaisons: Math.max(0, prev.totalMaisons - 1),
      }));

      alert("Maison supprimée avec succès");
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Erreur lors de la suppression de la maison");
    }
  };

  const renderStars = (note) => {
    const rating = Math.round(note || 0);

    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }
      />
    ));
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatutClass = (statut) => {
    switch (statut) {
      case "confirmée":
        return "bg-green-100 text-green-700";
      case "annulée":
        return "bg-red-100 text-red-700";
      case "en_attente":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatutText = (statut) => {
    switch (statut) {
      case "confirmée":
        return "✓ Confirmée";
      case "annulée":
        return "✗ Annulée";
      case "en_attente":
        return "⏳ En attente";
      default:
        return statut || "Inconnu";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Chargement de votre espace...
          </p>
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
                <h2 className="text-xl font-bold text-gray-900">
                  DarHôtes
                </h2>
                <p className="text-sm text-gray-500">
                  Espace Propriétaire
                </p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Menu Principal
            </p>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === "parametres"
                  ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Paramètres</span>
            </button>
          </nav>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1">
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
                  {activeTab === "overview" &&
                    "Bienvenue dans votre espace propriétaire"}
                  {activeTab === "maisons" &&
                    "Gérez vos maisons d'hôtes"}
                  {activeTab === "reservations" &&
                    "Consultez les réservations de vos clients"}
                  {activeTab === "parametres" &&
                    "Personnalisez votre espace"}
                </p>
              </div>

              <Link
                to="/ajouter-maison"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvelle maison
              </Link>
            </div>
          </div>

          <div className="p-8">
            {/* VUE D'ENSEMBLE */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    icon={<Home className="w-6 h-6 text-blue-500" />}
                    value={stats.totalMaisons}
                    title="Maisons"
                    description="Total de vos propriétés"
                  />

                  <StatCard
                    icon={<Bed className="w-6 h-6 text-green-500" />}
                    value={stats.totalChambres}
                    title="Chambres"
                    description="Capacité d'accueil"
                  />

                  <StatCard
                    icon={<Calendar className="w-6 h-6 text-purple-500" />}
                    value={stats.totalReservations}
                    title="Réservations"
                    description="Total reçues"
                  />

                  <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-yellow-500" />}
                    value={`${stats.revenus} DT`}
                    title="Revenus"
                    description="Total généré"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mes maisons récentes
                    </h3>

                    <button
                      onClick={() => setActiveTab("maisons")}
                      className="text-yellow-600 text-sm font-medium flex items-center gap-1"
                    >
                      Voir toutes
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {maisons.slice(0, 3).map((maison) => (
                      <div
                        key={maison._id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              maison.photos?.[0] ||
                              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"
                            }
                            alt={maison.nom}
                            className="w-12 h-12 rounded-lg object-cover"
                          />

                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {maison.nom}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin size={12} className="text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {maison.ville}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/mes-maisons/${maison._id}/chambres`}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Gérer les chambres"
                          >
                            <Bed size={18} className="text-green-500" />
                          </Link>

                          <Link
                            to={`/modifier-maison/${maison._id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Modifier la maison"
                          >
                            <Edit size={18} className="text-blue-500" />
                          </Link>

                          <button
                            onClick={() => handleDelete(maison._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Supprimer la maison"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {maisons.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        Aucune maison trouvée.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MES MAISONS */}
            {activeTab === "maisons" && (
              <div>
                {maisons.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <Home className="w-12 h-12 text-yellow-500 mx-auto mb-6" />

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Bienvenue dans votre espace
                    </h3>

                    <p className="text-gray-500 mb-6">
                      Vous n'avez pas encore de maison d'hôte
                    </p>

                    <Link
                      to="/ajouter-maison"
                      className="inline-flex items-center gap-2 bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl"
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
                        className="group bg-white rounded-2xl shadow-sm overflow-hidden"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={
                              maison.photos?.[0] ||
                              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"
                            }
                            alt={maison.nom}
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star size={12} className="fill-current" />
                            <span>{maison.note || 4.5}</span>
                          </div>

                          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <MapPin size={12} />
                            {maison.ville}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {maison.nom}
                          </h3>

                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                            {maison.description || "Aucune description"}
                          </p>

                          <div className="flex items-center gap-1 mb-4">
                            {renderStars(maison.note)}
                            <span className="text-xs text-gray-400 ml-2">
                              ({maison.note || 4.5})
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/mes-maisons/${maison._id}/chambres`}
                              className="flex-1 text-center bg-green-50 text-green-600 font-semibold py-2 rounded-xl"
                            >
                              <Bed size={15} className="inline mr-1" />
                              Chambres
                            </Link>

                            <Link
                              to={`/modifier-maison/${maison._id}`}
                              className="flex-1 text-center bg-blue-50 text-blue-600 font-semibold py-2 rounded-xl"
                            >
                              <Edit size={15} className="inline mr-1" />
                              Modifier
                            </Link>

                            <button
                              onClick={() => handleDelete(maison._id)}
                              className="flex-1 text-center bg-red-50 text-red-600 font-semibold py-2 rounded-xl"
                            >
                              <Trash2 size={15} className="inline mr-1" />
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

            {/* RESERVATIONS */}
            {activeTab === "reservations" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                  📅 Réservations reçues
                </h2>

                {reservationsOwner.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Aucune réservation pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservationsOwner.map((resa) => (
                      <div
                        key={resa._id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users size={20} className="text-blue-600" />
                              </div>

                              <div>
                                <p className="font-bold text-gray-900">
                                  {resa.clientId?.firstName ||
                                    resa.clientId?.name ||
                                    "Client"}{" "}
                                  {resa.clientId?.lastName || ""}
                                </p>

                                <div className="flex flex-wrap gap-3 mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail size={12} />
                                    {resa.clientId?.email || "Email non disponible"}
                                  </span>

                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone size={12} />
                                    {resa.clientId?.phone || "Tél non renseigné"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm">
                                  <b>🛏️ Chambre :</b>{" "}
                                  {resa.chambreId?.nom || "Chambre"}
                                </p>

                                <p className="text-sm">
                                  <b>🏠 Maison :</b>{" "}
                                  {resa.maisonId?.nom || "Maison"}
                                </p>

                                <p className="text-sm">
                                  <b>📍 Adresse :</b>{" "}
                                  {resa.maisonId?.adresse || ""},{" "}
                                  {resa.maisonId?.ville || ""}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm">
                                  <b>📅 Dates :</b>{" "}
                                  {formatDate(resa.dateDebut)} →{" "}
                                  {formatDate(resa.dateFin)}
                                </p>

                                <p className="text-sm">
                                  <b>👤 Voyageurs :</b>{" "}
                                  {resa.nombreAdultes} adulte(s),{" "}
                                  {resa.nombreEnfants} enfant(s)
                                </p>

                                <p className="text-sm">
                                  <b>📅 Nuits :</b> {resa.nombreNuits}
                                </p>

                                <p className="text-sm">
                                  <b>💰 Prix par nuit :</b>{" "}
                                  {resa.chambreId?.prix || 0} DT
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right min-w-[150px]">
                            <p className="text-3xl font-bold text-yellow-600">
                              {resa.prixTotal} DT
                            </p>

                            <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                              <Clock size={12} />
                              Réservé le {formatDate(resa.createdAt)}
                            </p>

                            <span
                              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatutClass(
                                resa.statut
                              )}`}
                            >
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

            {/* PARAMETRES */}
            {activeTab === "parametres" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Paramètres du compte
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">
                        Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Recevoir les alertes par email
                      </p>
                    </div>

                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">
                      Configurer
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Langue</p>
                      <p className="text-sm text-gray-500">Français</p>
                    </div>

                    <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Modifier
                    </button>
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

// Composant pour les statistiques
function StatCard({ icon, value, title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>

        <span className="text-3xl font-bold text-gray-800">
          {value}
        </span>
      </div>

      <p className="text-gray-600 font-medium">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
