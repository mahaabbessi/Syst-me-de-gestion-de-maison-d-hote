import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Users,
  MapPin,
  Star,
  X,
  CheckCircle,
  BedDouble,
  Loader2,
  CloudSun,
  ExternalLink,
  Navigation,
} from "lucide-react";

import {
  getMaisonById,
  getChambresByMaison,
  createReservation,
} from "../services/api";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://gestion-maison-hote-backend.onrender.com";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const DEFAULT_MAISON_IMAGE =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200";

const DEFAULT_CHAMBRE_IMAGE =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800";

export default function MaisonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maison, setMaison] = useState(null);
  const [chambres, setChambres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingChambres, setLoadingChambres] = useState(true);

  const [meteo, setMeteo] = useState(null);
  const [loadingMeteo, setLoadingMeteo] = useState(false);
  const [erreurMeteo, setErreurMeteo] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [chambreSelectionnee, setChambreSelectionnee] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adultes, setAdultes] = useState(2);
  const [enfants, setEnfants] = useState(0);

  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationEnCours, setReservationEnCours] = useState(false);

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const [erreurDates, setErreurDates] = useState("");
  const [erreurReservation, setErreurReservation] = useState("");

  const calculerNuits = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) {
      return 0;
    }

    const debut = new Date(`${dateDebut}T00:00:00`);
    const fin = new Date(`${dateFin}T00:00:00`);

    const difference = fin.getTime() - debut.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const calculerPrixTotal = () => {
    if (!chambreSelectionnee || !checkIn || !checkOut) {
      return 0;
    }

    const nuits = calculerNuits(checkIn, checkOut);

    if (nuits <= 0) {
      return 0;
    }

    return Number(chambreSelectionnee.prix || 0) * nuits;
  };

  const obtenirCoordonneesMaison = () => {
    const latitude =
      maison?.latitude ??
      maison?.lat ??
      maison?.coordonnees?.latitude ??
      maison?.coordinates?.lat;

    const longitude =
      maison?.longitude ??
      maison?.lng ??
      maison?.coordonnees?.longitude ??
      maison?.coordinates?.lng;

    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      return {
        latitude,
        longitude,
      };
    }

    return null;
  };

  const ouvrirGoogleMaps = () => {
    if (!maison) {
      return;
    }

    const coordonnees = obtenirCoordonneesMaison();

    let url = "";

    if (coordonnees) {
      url = `https://www.google.com/maps/search/?api=1&query=${coordonnees.latitude},${coordonnees.longitude}`;
    } else {
      const adresse = [maison.adresse, maison.ville]
        .filter(Boolean)
        .join(", ");

      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        adresse
      )}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const chargerMeteo = async (ville) => {
    if (!ville) {
      setErreurMeteo("La ville de cette maison est introuvable.");
      return;
    }

    if (!WEATHER_API_KEY) {
      setErreurMeteo(
        "La clé météo est absente. Ajoutez VITE_WEATHER_API_KEY dans le fichier .env."
      );
      return;
    }

    try {
      setLoadingMeteo(true);
      setErreurMeteo("");

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          ville
        )}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Impossible de récupérer la météo."
        );
      }

      setMeteo(data);
    } catch (error) {
      console.error("Erreur récupération météo :", error);
      setMeteo(null);
      setErreurMeteo(
        "La météo de cette ville n'est pas disponible actuellement."
      );
    } finally {
      setLoadingMeteo(false);
    }
  };

  useEffect(() => {
    const chargerMaison = async () => {
      try {
        setLoading(true);

        const response = await getMaisonById(id);
        const maisonRecuperee = response?.data || response;

        setMaison(maisonRecuperee);

        if (maisonRecuperee?.ville) {
          chargerMeteo(maisonRecuperee.ville);
        }
      } catch (error) {
        console.error("Erreur récupération maison :", error);
        setMaison(null);
      } finally {
        setLoading(false);
      }
    };

    chargerMaison();
  }, [id]);

  useEffect(() => {
    const chargerChambres = async () => {
      try {
        setLoadingChambres(true);

        const response = await getChambresByMaison(id);
        const chambresRecuperees = response?.data || response || [];

        setChambres(Array.isArray(chambresRecuperees) ? chambresRecuperees : []);
      } catch (error) {
        console.error("Erreur récupération chambres :", error);
        setChambres([]);
      } finally {
        setLoadingChambres(false);
      }
    };

    chargerChambres();
  }, [id]);

  useEffect(() => {
    setPrixTotal(calculerPrixTotal());
  }, [checkIn, checkOut, chambreSelectionnee]);

  const ouvrirModal = (chambre) => {
    setChambreSelectionnee(chambre);
    setShowModal(true);

    setCheckIn("");
    setCheckOut("");
    setAdultes(2);
    setEnfants(0);
    setPrixTotal(0);

    setErreurDates("");
    setErreurReservation("");
    setConfirmationMessage(null);
    setShowNotification(false);
  };

  const fermerModal = () => {
    if (reservationEnCours) {
      return;
    }

    setShowModal(false);
    setChambreSelectionnee(null);
    setConfirmationMessage(null);
    setErreurDates("");
    setErreurReservation("");
  };

  const modifierDate = (type, value) => {
    if (type === "checkIn") {
      setCheckIn(value);
    }

    if (type === "checkOut") {
      setCheckOut(value);
    }

    setErreurDates("");
    setErreurReservation("");
  };

  const reserverMaintenant = async () => {
    setErreurDates("");
    setErreurReservation("");

    if (!checkIn || !checkOut) {
      setErreurDates(
        "Veuillez choisir la date d'arrivée et la date de départ."
      );
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setErreurDates(
        "La date de départ doit être après la date d'arrivée."
      );
      return;
    }

    const nuits = calculerNuits(checkIn, checkOut);

    if (nuits <= 0) {
      setErreurDates("Les dates sélectionnées sont invalides.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter pour effectuer une réservation.");
      navigate("/login");
      return;
    }

    if (!chambreSelectionnee) {
      setErreurReservation("Veuillez sélectionner une chambre.");
      return;
    }

    try {
      setReservationEnCours(true);

      const response = await createReservation({
        chambreId: chambreSelectionnee._id,
        dateDebut: checkIn,
        dateFin: checkOut,
        nombreAdultes: Number(adultes),
        nombreEnfants: Number(enfants),
      });

      console.log("Réponse réservation :", response?.data || response);

      const total = Number(chambreSelectionnee.prix || 0) * nuits;

      setPrixTotal(total);

      setConfirmationMessage({
        suite: chambreSelectionnee.nom,
        prix: chambreSelectionnee.prix,
        checkIn,
        checkOut,
        adultes,
        enfants,
        nuits,
        total,
      });

      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 6000);
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Une erreur est survenue pendant la réservation.";

      setErreurReservation(message);
    } finally {
      setReservationEnCours(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-yellow-600"
            size={45}
          />
          <p className="mt-3 text-gray-600">
            Chargement de la maison...
          </p>
        </div>
      </div>
    );
  }

  if (!maison) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          Maison introuvable
        </h2>

        <button
          onClick={() => navigate("/maisons")}
          className="mt-5 rounded-xl bg-yellow-600 px-5 py-3 text-white"
        >
          Retour aux maisons
        </button>
      </div>
    );
  }

  const coordonneesMaison = obtenirCoordonneesMaison();

  const imageMaison =
    maison.photos?.[0] ||
    maison.image ||
    maison.photo ||
    DEFAULT_MAISON_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50">
      {showNotification && (
        <div className="fixed right-5 top-5 z-[200] w-[calc(100%-40px)] max-w-md">
          <div className="flex items-start gap-3 rounded-2xl bg-green-600 p-5 text-white shadow-2xl">
            <CheckCircle size={30} className="mt-1 shrink-0" />

            <div className="flex-1">
              <h3 className="text-lg font-bold">
                Réservation confirmée !
              </h3>

              <p className="mt-1 text-sm">
                Votre réservation a été confirmée avec succès.
              </p>

              <p className="mt-1 text-sm">
                Vous pouvez consulter vos réservations dans votre espace
                client.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNotification(false)}
              className="rounded-lg p-1 hover:bg-green-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <header className="bg-gray-950 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/maisons")}
            className="flex items-center gap-2 text-sm hover:text-yellow-400"
          >
            <ArrowLeft size={18} />
            Retour aux maisons
          </button>

          <h1 className="text-xl font-bold text-yellow-500">
            DarHôte
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <div className="h-[320px] lg:h-[450px]">
              <img
                src={imageMaison}
                alt={maison.nom}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={17} />

                <span>
                  {maison.adresse || "Adresse non disponible"}
                  {maison.ville ? `, ${maison.ville}` : ""}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                {maison.nom}
              </h2>

              <div className="mt-3 flex items-center gap-1">
                <Star
                  size={18}
                  className="fill-yellow-500 text-yellow-500"
                />

                <span className="font-semibold">
                  {maison.note || "4.5"}
                </span>

                <span className="text-gray-500">/ 5</span>
              </div>

              <p className="mt-6 leading-7 text-gray-600">
                {maison.description ||
                  "Aucune description disponible."}
              </p>

              {maison.equipements?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-bold text-gray-900">
                    Équipements
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {maison.equipements.map((equipement, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-yellow-50 px-3 py-2 text-sm text-yellow-700"
                      >
                        {equipement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={ouvrirGoogleMaps}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Navigation size={18} />
                  Voir sur Google Maps
                  <ExternalLink size={16} />
                </button>
              </div>

              {coordonneesMaison && (
                <p className="mt-3 text-xs text-gray-400">
                  Coordonnées : {coordonneesMaison.latitude},{" "}
                  {coordonneesMaison.longitude}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <CloudSun className="text-yellow-600" size={27} />

            <h2 className="text-2xl font-bold text-gray-900">
              Météo à {maison.ville || "destination"}
            </h2>
          </div>

          {loadingMeteo ? (
            <div className="py-8 text-center">
              <Loader2
                className="mx-auto animate-spin text-yellow-600"
                size={35}
              />

              <p className="mt-3 text-gray-500">
                Chargement de la météo...
              </p>
            </div>
          ) : erreurMeteo ? (
            <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
              {erreurMeteo}
            </div>
          ) : meteo ? (
            <div className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {meteo.name}
                </p>

                <p className="mt-1 text-sm capitalize text-blue-50">
                  {meteo.weather?.[0]?.description}
                </p>

                <p className="mt-4 text-5xl font-bold">
                  {Math.round(meteo.main?.temp)}°C
                </p>
              </div>

              <div className="text-center">
                {meteo.weather?.[0]?.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${meteo.weather[0].icon}@2x.png`}
                    alt={meteo.weather?.[0]?.description || "Météo"}
                    className="mx-auto h-28 w-28"
                  />
                )}

                <p className="text-sm">
                  Ressenti : {Math.round(meteo.main?.feels_like)}°C
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  Humidité : {meteo.main?.humidity}%
                </p>

                <p>
                  Vent : {meteo.wind?.speed} m/s
                </p>

                <p>
                  Température min :{" "}
                  {Math.round(meteo.main?.temp_min)}°C
                </p>

                <p>
                  Température max :{" "}
                  {Math.round(meteo.main?.temp_max)}°C
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 p-5 text-center text-gray-500">
              Aucune information météo disponible.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <BedDouble className="text-yellow-600" size={27} />

            <h2 className="text-2xl font-bold text-gray-900">
              Chambres disponibles
            </h2>
          </div>

          {loadingChambres ? (
            <div className="py-10 text-center">
              <Loader2
                className="mx-auto animate-spin text-yellow-600"
                size={35}
              />

              <p className="mt-3 text-gray-500">
                Chargement des chambres...
              </p>
            </div>
          ) : chambres.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
              Aucune chambre disponible pour cette maison.
            </div>
          ) : (
            <div className="space-y-5">
              {chambres.map((chambre) => (
                <div
                  key={chambre._id}
                  className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 md:grid-cols-[240px_1fr]"
                >
                  <div className="h-56 md:h-full">
                    <img
                      src={
                        chambre.photo ||
                        chambre.image ||
                        chambre.photos?.[0] ||
                        DEFAULT_CHAMBRE_IMAGE
                      }
                      alt={chambre.nom}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {chambre.nom}
                      </h3>

                      <p className="mt-2 text-gray-600">
                        {chambre.description ||
                          "Chambre confortable et bien équipée."}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <Users size={17} />

                        Capacité : {chambre.capacite || 2} personnes
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-3xl font-bold text-yellow-600">
                          {chambre.prix}
                        </span>

                        <span className="ml-1 text-gray-500">
                          DT / nuit
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => ouvrirModal(chambre)}
                        className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-white transition hover:bg-yellow-600"
                      >
                        Réserver maintenant
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && chambreSelectionnee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {confirmationMessage
                  ? "Réservation confirmée"
                  : "Réserver"}
              </h2>

              <button
                type="button"
                onClick={fermerModal}
                disabled={reservationEnCours}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </button>
            </div>

            {!confirmationMessage ? (
              <>
                <div className="mb-5 rounded-xl bg-gray-50 p-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {chambreSelectionnee.nom}
                  </h3>

                  <p className="mt-1">
                    <span className="text-2xl font-bold text-yellow-600">
                      {chambreSelectionnee.prix} DT
                    </span>{" "}
                    <span className="text-gray-500">/ nuit</span>
                  </p>
                </div>

                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <CalendarDays
                      size={18}
                      className="text-yellow-600"
                    />

                    Dates
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Date d'arrivée
                      </label>

                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(event) =>
                          modifierDate("checkIn", event.target.value)
                        }
                        disabled={reservationEnCours}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Date de départ
                      </label>

                      <input
                        type="date"
                        value={checkOut}
                        min={
                          checkIn ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(event) =>
                          modifierDate("checkOut", event.target.value)
                        }
                        disabled={reservationEnCours}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {erreurDates && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {erreurDates}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <Users size={18} className="text-yellow-600" />
                    Voyageurs
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Adultes
                      </label>

                      <select
                        value={adultes}
                        onChange={(event) =>
                          setAdultes(Number(event.target.value))
                        }
                        disabled={reservationEnCours}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-yellow-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map((nombre) => (
                          <option key={nombre} value={nombre}>
                            {nombre} adulte{nombre > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Enfants
                      </label>

                      <select
                        value={enfants}
                        onChange={(event) =>
                          setEnfants(Number(event.target.value))
                        }
                        disabled={reservationEnCours}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-yellow-500"
                      >
                        {[0, 1, 2, 3, 4, 5].map((nombre) => (
                          <option key={nombre} value={nombre}>
                            {nombre} enfant{nombre > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-gray-500">
                    Total pour{" "}
                    {calculerNuits(checkIn, checkOut) || 0} nuit
                    {calculerNuits(checkIn, checkOut) > 1 ? "s" : ""}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-yellow-600">
                    {prixTotal} DT
                  </p>
                </div>

                {erreurReservation && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {erreurReservation}
                  </div>
                )}

                <button
                  type="button"
                  onClick={reserverMaintenant}
                  disabled={reservationEnCours}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 font-bold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reservationEnCours && (
                    <Loader2 className="animate-spin" size={20} />
                  )}

                  {reservationEnCours
                    ? "Réservation en cours..."
                    : "Confirmer la réservation"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-400">
                  Annulation gratuite · Confirmation instantanée
                </p>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle
                  size={70}
                  className="mx-auto text-green-600"
                />

                <h3 className="mt-4 text-2xl font-bold text-green-700">
                  Réservation confirmée !
                </h3>

                <p className="mt-2 text-gray-600">
                  Votre réservation a été enregistrée avec succès.
                </p>

                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
                  <p>
                    <strong>Chambre :</strong>{" "}
                    {confirmationMessage.suite}
                  </p>

                  <p className="mt-2">
                    <strong>Arrivée :</strong>{" "}
                    {formatDate(confirmationMessage.checkIn)}
                  </p>

                  <p className="mt-2">
                    <strong>Départ :</strong>{" "}
                    {formatDate(confirmationMessage.checkOut)}
                  </p>

                  <p className="mt-2">
                    <strong>Voyageurs :</strong>{" "}
                    {confirmationMessage.adultes} adulte(s),{" "}
                    {confirmationMessage.enfants} enfant(s)
                  </p>

                  <p className="mt-2">
                    <strong>Nombre de nuits :</strong>{" "}
                    {confirmationMessage.nuits}
                  </p>

                  <p className="mt-3 text-xl font-bold text-yellow-600">
                    Total : {confirmationMessage.total} DT
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={fermerModal}
                    className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Fermer
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mes-reservations")}
                    className="flex-1 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white hover:bg-yellow-600"
                  >
                    Mes réservations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
