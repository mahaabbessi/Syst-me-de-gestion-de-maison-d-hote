import { useEffect, useState } from "react";
import { getAllMaisons } from "../services/api.js";
import { Link } from "react-router-dom";
import StarRating from "../components/StarRating";

export default function MaisonsPage() {
  const [maisons, setMaisons] = useState([]);
  const [filtrees, setFiltrees] = useState([]);
  const [ville, setVille] = useState("Toutes");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fonction pour normaliser le nom d'une ville
  const normaliserVille = (nom) => {
    return nom.trim().charAt(0).toUpperCase() + nom.trim().slice(1).toLowerCase();
  };

  // Fonction pour récupérer les infos utilisateur
  const getUserInfo = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role);
    console.log("🔍 Rôle détecté:", role);
  };

  useEffect(() => {
    getUserInfo();
    
    getAllMaisons()
      .then((res) => {
        setMaisons(res.data);
        setFiltrees(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrer = (v) => {
    setVille(v);
    if (v === "Toutes") {
      setFiltrees(maisons);
    } else {
      const villeNormalisee = normaliserVille(v);
      setFiltrees(maisons.filter((m) => normaliserVille(m.ville) === villeNormalisee));
    }
  };

  const villesUniques = [...new Set(maisons.map((m) => normaliserVille(m.ville)))];
  villesUniques.sort();
  const villes = ["Toutes", ...villesUniques];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PAGE HEADER */}
      <div className="bg-gray-900 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-0.5 bg-yellow-500"></div>
          <span className="text-yellow-500 text-sm font-semibold uppercase tracking-widest">
            Nos Maisons
          </span>
          <div className="w-10 h-0.5 bg-yellow-500"></div>
        </div>
        <h1 className="text-4xl font-bold text-white">
          Toutes nos <span className="text-yellow-500">Maisons d'Hôtes</span>
        </h1>
        <p className="text-gray-400 mt-3">
          Accueil &nbsp;›&nbsp;
          <span className="text-yellow-500">Maisons</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* FILTRES PAR VILLE */}
        <div className="flex flex-wrap gap-3 mb-10">
          {villes.map((v) => (
            <button
              key={v}
              onClick={() => filtrer(v)}
              className={`px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                ville === v
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* CHARGEMENT */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Chargement...</p>
          </div>
        ) : filtrees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucune maison disponible.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtrees.map((m) => (
              <div
                key={m._id}
                className="bg-white shadow-md hover:-translate-y-2 transition-transform duration-300 overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={m.photos?.[0] || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"}
                    alt={m.nom}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 uppercase">
                    {normaliserVille(m.ville)}
                  </div>
                </div>

                {/* BODY */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{m.nom}</h3>
                    <StarRating rating={m.note} />
                  </div>

                  <p className="text-gray-400 text-sm mb-2">📍 {m.adresse}</p>

                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {m.description?.substring(0, 90)}
                    {m.description?.length > 90 ? "..." : ""}
                  </p>

                  {/* BOUTONS ADAPTÉS SELON LE RÔLE */}
                  <div className="flex gap-2">
                    <Link
                      to={`/maisons/${m._id}`}
                      className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold uppercase py-2 transition-all"
                    >
                      Voir détails
                    </Link>

                    {isLoggedIn && userRole === "client" && (
                      <Link
                        to={`/maisons/${m._id}`}
                        className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold uppercase py-2 transition-all"
                      >
                        Réserver
                      </Link>
                    )}

                    {isLoggedIn && userRole === "owner" && (
                      <Link
                        to={`/modifier-maison/${m._id}`}
                        className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold uppercase py-2 transition-all"
                      >
                        Gérer
                      </Link>
                    )}

                    {!isLoggedIn && (
                      <Link
                        to="/login"
                        className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold uppercase py-2 transition-all"
                      >
                        Se connecter
                      </Link>
                    )}
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