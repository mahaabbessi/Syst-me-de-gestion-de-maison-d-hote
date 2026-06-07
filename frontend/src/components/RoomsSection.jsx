import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllMaisons } from "../services/api.js";
import StarRating from "./StarRating";

export default function RoomsSection() {
  const [maisons, setMaisons] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role);

    getAllMaisons()
      .then((res) => setMaisons(res.data.slice(0, 3)))
      .catch(console.error);
  }, []);

  const defaultRooms = [
    {
      _id: "1",
      nom: "Dar El Bahr",
      description: "Belle maison d'hôtes avec vue mer, décorée en style mauresque traditionnel.",
      note: 5,
      img: "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=600",
    },
    {
      _id: "2",
      nom: "Riad Tabarka",
      description: "Magnifique riad au cœur de la nature tunisienne avec piscine et vue sur la forêt.",
      note: 4,
      img: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600",
    },
    {
      _id: "3",
      nom: "Villa Djerba",
      description: "Villa traditionnelle avec architecture arabo-andalouse et patio fleuri.",
      note: 4.5,
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
  ];

  const rooms = maisons.length > 0 ? maisons : defaultRooms;

  return (
    <div className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* TITRE */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-0.5 bg-yellow-500"></div>
            <span className="text-yellow-500 text-sm font-semibold uppercase tracking-widest">
              Our Rooms
            </span>
            <div className="w-10 h-0.5 bg-yellow-500"></div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            Explorez nos <span className="text-yellow-500 uppercase">Maisons</span>
          </h2>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="shadow-lg rounded overflow-hidden hover:-translate-y-2 transition-transform duration-300"
            >
              {/* IMAGE */}
              <div>
                <img
                  src={room.photos?.[0] || room.img || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"}
                  alt={room.nom}
                  className="w-full h-56 object-cover"
                />
              </div>

              {/* BODY */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-lg font-bold text-gray-900">{room.nom}</h5>
                  <StarRating rating={room.note} />
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {room.description?.substring(0, 100) || "Belle maison d'hôtes avec tout le confort moderne dans un cadre authentique."}
                  {room.description?.length > 100 ? "..." : ""}
                </p>

                {/* BOUTONS */}
                <div className="flex justify-between">
                  <Link
                    to={`/maisons/${room._id}`}
                    className="bg-gray-900 text-white text-sm font-semibold uppercase px-5 py-2 hover:bg-gray-700 transition-all rounded"
                  >
                    Voir détails
                  </Link>

                  {isLoggedIn && userRole === "client" && (
                    <Link
                      to={`/maisons/${room._id}`}
                      className="bg-yellow-500 text-white text-sm font-semibold uppercase px-5 py-2 hover:bg-yellow-600 transition-all rounded"
                    >
                      Réserver
                    </Link>
                  )}

                  {isLoggedIn && userRole === "owner" && (
                    <Link
                      to={`/modifier-maison/${room._id}`}
                      className="bg-blue-500 text-white text-sm font-semibold uppercase px-5 py-2 hover:bg-blue-600 transition-all rounded"
                    >
                      Gérer
                    </Link>
                  )}

                  {!isLoggedIn && (
                    <Link
                      to="/login"
                      className="bg-yellow-500 text-white text-sm font-semibold uppercase px-5 py-2 hover:bg-yellow-600 transition-all rounded"
                    >
                      Se connecter
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* VOIR TOUTES */}
        <div className="text-center mt-12">
          <Link
            to="/maisons"
            className="bg-yellow-500 text-white font-semibold uppercase tracking-wider px-10 py-4 hover:bg-yellow-600 transition-all inline-block"
          >
            Voir toutes les maisons →
          </Link>
        </div>
      </div>
    </div>
  );
}