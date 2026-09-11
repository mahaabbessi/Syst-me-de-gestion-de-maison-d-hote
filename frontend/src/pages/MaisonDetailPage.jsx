import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getMaisonById,
  getChambresByMaison,
  createReservation
} from "../services/api";

import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon
} from "lucide-react";

import GoogleMapComponent from "../components/GoogleMap";
import WeatherWidget from "../components/WeatherWidget";

export default function MaisonDetailPage() {
  const { id } = useParams();

  const [maison, setMaison] = useState(null);
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // États réservation
  const [showModal, setShowModal] = useState(false);
  const [chambreSelectionnee, setChambreSelectionnee] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adultes, setAdultes] = useState(2);
  const [enfants, setEnfants] = useState(0);
  const [prixTotal, setPrixTotal] = useState(null);
  const [reservationEnCours, setReservationEnCours] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [erreurDates, setErreurDates] = useState("");

  // URL du backend Render
  const BACKEND_URL =
    import.meta.env.VITE_API_URL ||
    "https://gestion-maison-hote-backend.onrender.com";

  // Corrige les chemins des photos
  const getPhotoUrl = (photo) => {
    if (!photo) return null;

    // Si la photo est déjà une URL complète
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    // Si la photo commence par /, on garde le chemin
    if (photo.startsWith("/")) {
      return photo;
    }

    // Si la photo est enregistrée comme images/photo.jpg
    return `/${photo}`;
  };

  // URL alternative pour les photos stockées côté backend
  const getBackendPhotoUrl = (photo) => {
    if (!photo) return null;

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    if (photo.startsWith("/")) {
      return `${BACKEND_URL}${photo}`;
    }

    return `${BACKEND_URL}/${photo}`;
  };

  const handleImageError = (event, photo, fallback) => {
    const image = event.currentTarget;

    // Première tentative : photo depuis le backend Render
    const backendPhoto = getBackendPhotoUrl(photo);

    if (
      backendPhoto &&
      image.src !== backendPhoto &&
      !image.dataset.backendTried
    ) {
      image.dataset.backendTried = "true";
      image.src = backendPhoto;
      return;
    }

    // Dernière solution : image par défaut
    if (fallback && image.src !== fallback) {
      image.src = fallback;
    }
  };

  // Fonction date du jour
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Calcul du nombre de nuits
  const calculerNuits = (debut, fin) => {
    if (!debut || !fin) return 0;

    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const diffTime = dateFin - dateDebut;
    const diffNuits = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffNuits > 0 ? diffNuits : 0;
  };

  // Validation des dates
  const validerDates = (debut, fin) => {
    if (!debut || !fin) return true;

    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    if (dateDebut < aujourdHui) {
      setErreurDates(
        "❌ La date de début ne peut pas être dans le passé"
      );
      return false;
    }

    if (dateFin <= dateDebut) {
      setErreurDates(
        "❌ La date de fin doit être après la date de début"
      );
      return false;
    }

    setErreurDates("");
    return true;
  };

  // Chargement de la maison et des chambres
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const maisonResponse = await getMaisonById(id);
        setMaison(maisonResponse.data);

        const chambresResponse = await getChambresByMaison(id);
        setChambres(chambresResponse.data);
      } catch (error) {
        console.error(
          "Erreur chargement maison/chambres :",
          error
        );

        setChambres([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      chargerDonnees();
    }
  }, [id]);

  // Calcul automatique du prix total
  useEffect(() => {
    if (chambreSelectionnee && checkIn && checkOut) {
      const nuits = calculerNuits(checkIn, checkOut);

      if (nuits > 0) {
        setPrixTotal(chambreSelectionnee.prix * nuits);
      } else {
        setPrixTotal(null);
      }
    } else {
      setPrixTotal(null);
    }
  }, [checkIn, checkOut, chambreSelectionnee]);

  // Validation automatique des dates
  useEffect(() => {
    if (checkIn && checkOut) {
      validerDates(checkIn, checkOut);
    } else {
      setErreurDates("");
    }
  }, [checkIn, checkOut]);

  const ouvrirModal = (chambre) => {
    setChambreSelectionnee(chambre);
    setShowModal(true);
    setConfirmationMessage(null);
    setCheckIn("");
    setCheckOut("");
    setAdultes(2);
    setEnfants(0);
    setPrixTotal(null);
    setErreurDates("");
  };

  const fermerModalEtReinitialiser = () => {
    setShowModal(false);
    setConfirmationMessage(null);
    setChambreSelectionnee(null);
    setCheckIn("");
    setCheckOut("");
    setPrixTotal(null);
    setAdultes(2);
    setEnfants(0);
    setReservationEnCours(false);
    setErreurDates("");
  };

  const reserverMaintenant = async () => {
    if (!checkIn || !checkOut) {
      setErreurDates("❌ Veuillez sélectionner les dates");
      return;
    }

    if (!validerDates(checkIn, checkOut)) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter");
      return;
    }

    setReservationEnCours(true);

    try {
      const response = await createReservation({
        chambreId: chambreSelectionnee._id,
        dateDebut: checkIn,
        dateFin: checkOut,
        nombreAdultes: adultes,
        nombreEnfants: enfants
      });

      const data = response.data;

      console.log("Réservation créée :", data);

      const nuits = calculerNuits(checkIn, checkOut);

      setConfirmationMessage({
        suite: chambreSelectionnee.nom,
        prix: chambreSelectionnee.prix,
        dates: {
          checkIn,
          checkOut
        },
        adultes,
        enfants,
        nuits,
        total: prixTotal
      });
    } catch (error) {
      console.error("Erreur réservation :", error);

      if (error.response?.status === 409) {
        setErreurDates(
          "❌ Cette chambre est déjà réservée pour ces dates !"
        );

        alert(
          "❌ Cette chambre est déjà réservée pour ces dates !"
        );
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Erreur lors de la réservation");
      }
    } finally {
      setReservationEnCours(false);
    }
  };

  const nextPhoto = () => {
    if (maison?.photos?.length) {
      setCurrentPhotoIndex(
        (prev) => (prev + 1) % maison.photos.length
      );
    }
  };

  const prevPhoto = () => {
    if (maison?.photos?.length) {
      setCurrentPhotoIndex(
        (prev) =>
          (prev - 1 + maison.photos.length) %
          maison.photos.length
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        Chargement...
      </div>
    );
  }

  if (!maison) {
    return (
      <div className="text-center py-20">
        Maison non trouvée
      </div>
    );
  }

  const toutesLesPhotos = maison.photos || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* PHOTO PRINCIPALE */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <img
              src={
                getPhotoUrl(
                  toutesLesPhotos[currentPhotoIndex]
                ) || "/images/default-house.jpg"
              }
              alt={maison.nom}
              className="w-full h-[400px] object-cover"
              onError={(event) =>
                handleImageError(
                  event,
                  toutesLesPhotos[currentPhotoIndex],
                  "/images/default-house.jpg"
                )
              }
            />

            {toutesLesPhotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {toutesLesPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setCurrentPhotoIndex(index)
                      }
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentPhotoIndex
                          ? "bg-white w-6"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TITRE ET INFORMATIONS */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {maison.nom}
        </h1>

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {maison.adresse}, {maison.ville}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-gray-600">
              {maison.note || 0} / 5
            </span>

            <span className="text-gray-400">
              ({maison.nombreAvis || 0} avis)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-2 space-y-8">

            {/* DESCRIPTION */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-3">
                Description
              </h2>

              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {maison.description || "Aucune description"}
              </p>
            </div>

            {/* SERVICES ET ÉQUIPEMENTS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-3">
                Services & équipements
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {maison.equipements?.jardin && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🌳</span>
                    Jardin
                  </div>
                )}

                {maison.equipements?.piscine && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">🏊</span>
                    Piscine
                  </div>
                )}

                {maison.equipements?.parking && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🅿️</span>
                    Parking
                  </div>
                )}

                {maison.equipements?.wifi && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📶</span>
                    Wi-Fi
                  </div>
                )}

                {maison.equipements?.climatisation && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">❄️</span>
                    Climatisation
                  </div>
                )}

                {maison.equipements?.restaurant && (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">🍽️</span>
                    Restaurant
                  </div>
                )}

                {maison.equipements?.navetteAeroport && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✈️</span>
                    Navette
                  </div>
                )}

                {maison.equipements?.chambresFamiliales && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">👨‍👩‍👧‍👦</span>
                    Famille
                  </div>
                )}

                {maison.equipements?.serviceEtage && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🛎️</span>
                    Service
                  </div>
                )}

                {maison.equipements?.nonFumeurs && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">🚭</span>
                    Non-fumeurs
                  </div>
                )}
              </div>
            </div>

            {/* GALERIE */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Galerie photos
              </h2>

              {toutesLesPhotos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon
                    size={48}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p>Aucune photo disponible</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {toutesLesPhotos
                      .slice(0, 6)
                      .map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition"
                          onClick={() =>
                            setCurrentPhotoIndex(index)
                          }
                        >
                          <img
                            src={
                              getPhotoUrl(photo) ||
                              "/images/default-house.jpg"
                            }
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            onError={(event) =>
                              handleImageError(
                                event,
                                photo,
                                "/images/default-house.jpg"
                              )
                            }
                          />
                        </div>
                      ))}
                  </div>

                  {toutesLesPhotos.length > 6 && (
                    <button
                      onClick={() =>
                        setShowAllPhotos(!showAllPhotos)
                      }
                      className="mt-4 text-yellow-500 hover:text-yellow-600 font-medium"
                    >
                      {showAllPhotos
                        ? "Voir moins ▲"
                        : `Voir toutes les photos (${toutesLesPhotos.length}) ▼`}
                    </button>
                  )}

                  {showAllPhotos &&
                    toutesLesPhotos.length > 6 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {toutesLesPhotos
                          .slice(6)
                          .map((photo, index) => (
                            <div
                              key={index + 6}
                              className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition"
                              onClick={() =>
                                setCurrentPhotoIndex(index + 6)
                              }
                            >
                              <img
                                src={
                                  getPhotoUrl(photo) ||
                                  "/images/default-house.jpg"
                                }
                                alt={`Photo ${index + 7}`}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                onError={(event) =>
                                  handleImageError(
                                    event,
                                    photo,
                                    "/images/default-house.jpg"
                                  )
                                }
                              />
                            </div>
                          ))}
                      </div>
                    )}
                </>
              )}
            </div>

            {/* CHAMBRES */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Chambres disponibles
              </h2>

              {chambres.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Aucune chambre disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {chambres.map((chambre) => {
                    const photoChambre =
                      chambre.photos?.[0] ||
                      "/images/chambres/default-room.jpg";

                    return (
                      <div
                        key={chambre._id}
                        className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition"
                      >
                        <img
                          src={
                            getPhotoUrl(photoChambre) ||
                            "/images/chambres/default-room.jpg"
                          }
                          alt={chambre.nom}
                          className="w-full sm:w-40 h-40 object-cover rounded-lg"
                          onError={(event) =>
                            handleImageError(
                              event,
                              photoChambre,
                              "/images/chambres/default-room.jpg"
                            )
                          }
                        />

                        <div className="flex-1">
                          <h3 className="text-xl font-bold">
                            {chambre.nom}
                          </h3>

                          <p className="text-gray-500 text-sm mt-1">
                            Capacité : {chambre.capacite} personnes
                          </p>

                          <p className="text-gray-600 text-sm mt-2">
                            {chambre.description}
                          </p>

                          <div className="flex justify-between items-center mt-4">
                            <div>
                              <span className="text-2xl font-bold text-yellow-600">
                                {chambre.prix} DT
                              </span>

                              <span className="text-gray-400">
                                {" "}
                                /nuit
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                ouvrirModal(chambre)
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-1 space-y-6">

            {/* MÉTÉO */}
            <div className="transform scale-105 origin-top">
              <WeatherWidget ville={maison.ville} />
            </div>

            {/* GOOGLE MAPS */}
            {maison.latitude && maison.longitude && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold">
                    📍 Emplacement
                  </h2>

                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-yellow-500 text-sm font-medium hover:underline"
                  >
                    {showMap ? "Masquer" : "Voir sur carte"}
                  </button>
                </div>

                {showMap && (
                  <div className="h-[400px] rounded-lg overflow-hidden mb-3">
                    <GoogleMapComponent
                      latitude={maison.latitude}
                      longitude={maison.longitude}
                      address={maison.adresse}
                      name={maison.nom}
                    />
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  {maison.adresse}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL RÉSERVATION */}
      {showModal && chambreSelectionnee && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={fermerModalEtReinitialiser}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {!confirmationMessage ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    Réserver
                  </h2>

                  <button
                    onClick={fermerModalEtReinitialiser}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-lg">
                    {chambreSelectionnee.nom}
                  </p>

                  <p className="text-yellow-600 font-bold">
                    {chambreSelectionnee.prix} DT
                    <span className="text-xs text-gray-400">
                      {" "}
                      /nuit
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    📅 Dates
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={checkIn}
                      min={getTodayDate()}
                      onChange={(event) => {
                        const nouvelleDate =
                          event.target.value;

                        setCheckIn(nouvelleDate);

                        if (
                          checkOut &&
                          new Date(checkOut) <=
                            new Date(nouvelleDate)
                        ) {
                          setCheckOut("");
                        }
                      }}
                      className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />

                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || getTodayDate()}
                      disabled={!checkIn}
                      onChange={(event) =>
                        setCheckOut(event.target.value)
                      }
                      className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {erreurDates && (
                    <p className="text-red-500 text-sm mt-2">
                      {erreurDates}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    👥 Voyageurs
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={adultes}
                      onChange={(event) =>
                        setAdultes(
                          parseInt(event.target.value)
                        )
                      }
                      className="border rounded-lg px-3 py-2 flex-1"
                    >
                      {[1, 2, 3, 4, 5, 6].map((nombre) => (
                        <option key={nombre} value={nombre}>
                          {nombre} adulte
                          {nombre > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>

                    <select
                      value={enfants}
                      onChange={(event) =>
                        setEnfants(
                          parseInt(event.target.value)
                        )
                      }
                      className="border rounded-lg px-3 py-2 flex-1"
                    >
                      {[0, 1, 2, 3, 4].map((nombre) => (
                        <option key={nombre} value={nombre}>
                          {nombre} enfant
                          {nombre > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {prixTotal !== null && prixTotal > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">
                      Total pour{" "}
                      {calculerNuits(checkIn, checkOut)} nuit
                      {calculerNuits(checkIn, checkOut) > 1
                        ? "s"
                        : ""}
                    </p>

                    <p className="text-3xl font-bold text-yellow-600">
                      {prixTotal} DT
                    </p>
                  </div>
                )}

                <button
                  onClick={reserverMaintenant}
                  disabled={
                    reservationEnCours ||
                    !checkIn ||
                    !checkOut ||
                    !!erreurDates
                  }
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50"
                >
                  {reservationEnCours
                    ? "Réservation en cours..."
                    : "Confirmer la réservation"}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Annulation gratuite · Confirmation instantanée
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-green-600">
                    ✓ Réservation confirmée !
                  </h2>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-bold text-lg">
                    {confirmationMessage.suite}
                  </p>

                  <p className="text-yellow-600 font-bold">
                    {confirmationMessage.prix} DT
                    <span className="text-xs text-gray-400">
                      {" "}
                      /nuit
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    📅 Dates
                  </p>

                  <p className="font-medium">
                    {new Date(
                      confirmationMessage.dates.checkIn
                    ).toLocaleDateString("fr-FR")}{" "}
                    →{" "}
                    {new Date(
                      confirmationMessage.dates.checkOut
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    👥 Voyageurs
                  </p>

                  <p className="font-medium">
                    {confirmationMessage.adultes} adulte
                    {confirmationMessage.adultes > 1
                      ? "s"
                      : ""}{" "}
                    · {confirmationMessage.enfants} enfant
                    {confirmationMessage.enfants > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">
                    Total pour {confirmationMessage.nuits} nuit
                    {confirmationMessage.nuits > 1 ? "s" : ""}
                  </p>

                  <p className="text-3xl font-bold text-yellow-600">
                    {confirmationMessage.total} DT
                  </p>
                </div>

                <button
                  onClick={fermerModalEtReinitialiser}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600"
                >
                  OK
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Annulation gratuite · Confirmation instantanée
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
