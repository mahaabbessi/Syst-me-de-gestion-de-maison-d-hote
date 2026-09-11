import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMaisonById,
  getChambresByMaison,
  createReservation,
} from "../services/api";

import GoogleMapComponent from "../components/GoogleMap";
import WeatherWidget from "../components/WeatherWidget";

function MaisonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maison, setMaison] = useState(null);
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chambreSelectionnee, setChambreSelectionnee] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adultes, setAdultes] = useState(1);
  const [enfants, setEnfants] = useState(0);

  const [reservationEnCours, setReservationEnCours] = useState(false);
  const [erreurDates, setErreurDates] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  // Chargement de la maison et des chambres
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const maisonResponse = await getMaisonById(id);
        setMaison(maisonResponse.data);

        const chambresResponse = await getChambresByMaison(id);
        setChambres(chambresResponse.data);
      } catch (error) {
        console.error("Erreur chargement maison/chambres :", error);
        setMaison(null);
        setChambres([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      chargerDonnees();
    }
  }, [id]);

  const calculerNuits = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    return (fin - debut) / (1000 * 60 * 60 * 24);
  };

  const ouvrirReservation = (chambre) => {
    setChambreSelectionnee(chambre);
    setCheckIn("");
    setCheckOut("");
    setAdultes(1);
    setEnfants(0);
    setErreurDates("");
    setConfirmationMessage(null);
  };

  const fermerReservation = () => {
    setChambreSelectionnee(null);
    setErreurDates("");
  };

  const reserverMaintenant = async (event) => {
    event.preventDefault();

    setErreurDates("");
    setConfirmationMessage(null);

    if (!chambreSelectionnee) {
      alert("Veuillez sélectionner une chambre.");
      return;
    }

    if (!checkIn || !checkOut) {
      setErreurDates(
        "Veuillez choisir la date d'arrivée et la date de départ."
      );
      return;
    }

    const nuits = calculerNuits(checkIn, checkOut);

    if (nuits <= 0) {
      setErreurDates(
        "La date de départ doit être après la date d'arrivée."
      );
      return;
    }

    const prixTotal = chambreSelectionnee.prix * nuits;

    setReservationEnCours(true);

    try {
      const response = await createReservation({
        chambreId: chambreSelectionnee._id,
        dateDebut: checkIn,
        dateFin: checkOut,
        nombreAdultes: adultes,
        nombreEnfants: enfants,
      });

      console.log("Réservation créée :", response.data);

      setConfirmationMessage({
        chambre: chambreSelectionnee.nom,
        checkIn,
        checkOut,
        nuits,
        adultes,
        enfants,
        total: prixTotal,
      });

      setChambreSelectionnee(null);
    } catch (error) {
      console.error("Erreur réservation :", error);

      if (error.response?.status === 401) {
        alert("Veuillez vous connecter pour effectuer une réservation.");
        navigate("/login");
      } else if (error.response?.status === 409) {
        setErreurDates(
          "Cette chambre est déjà réservée pour ces dates."
        );
      } else if (error.response?.data?.message) {
        setErreurDates(error.response.data.message);
      } else {
        setErreurDates("Erreur lors de la réservation.");
      }
    } finally {
      setReservationEnCours(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h3>Chargement...</h3>
      </div>
    );
  }

  if (!maison) {
    return (
      <div className="container mt-5 text-center">
        <h3>Maison d'hôte introuvable</h3>

        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>

      {/* Informations principales */}
      <div className="mb-4">
        <h1>{maison.nom}</h1>

        <p className="text-muted">
          📍 {maison.adresse}, {maison.ville}
        </p>

        {maison.note !== undefined && (
          <p>
            ⭐ <strong>{maison.note}</strong> / 5
          </p>
        )}
      </div>

      {/* Galerie */}
      <div className="row mb-5">
        <div className="col-md-8">
          {maison.photos && maison.photos.length > 0 ? (
            <img
              src={maison.photos[0]}
              alt={maison.nom}
              className="img-fluid rounded w-100"
              style={{
                height: "400px",
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.src = "/images/default-maison.jpg";
              }}
            />
          ) : (
            <img
              src="/images/default-maison.jpg"
              alt={maison.nom}
              className="img-fluid rounded w-100"
              style={{
                height: "400px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div className="col-md-4 mt-3 mt-md-0">
          <div className="row">
            {maison.photos &&
              maison.photos.map((photo, index) => (
                <div className="col-6 mb-3" key={index}>
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="img-fluid rounded"
                    style={{
                      height: "120px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    onError={(event) => {
                      event.currentTarget.src =
                        "/images/default-maison.jpg";
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Description et services */}
        <div className="col-md-8">
          <section className="mb-5">
            <h2>Description</h2>

            <p style={{ whiteSpace: "pre-line" }}>
              {maison.description ||
                "Aucune description disponible pour cette maison d'hôte."}
            </p>
          </section>

          <section className="mb-5">
            <h2>Services et équipements</h2>

            {maison.features && maison.features.length > 0 ? (
              <div className="row">
                {maison.features.map((service, index) => (
                  <div className="col-md-6 mb-2" key={index}>
                    <div className="border rounded p-2">
                      ✓ {service}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">
                Aucun service renseigné.
              </p>
            )}
          </section>
        </div>

        {/* Informations et météo */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4>Informations</h4>

              <p>
                <strong>Adresse :</strong> {maison.adresse}
              </p>

              <p>
                <strong>Ville :</strong> {maison.ville}
              </p>

              {maison.telephone && (
                <p>
                  <strong>Téléphone :</strong> {maison.telephone}
                </p>
              )}

              {maison.email && (
                <p>
                  <strong>Email :</strong> {maison.email}
                </p>
              )}
            </div>
          </div>

          <WeatherWidget
            ville={maison.ville || maison.adresse || "Monastir"}
          />
        </div>
      </div>

      {/* Chambres */}
      <section className="mt-5">
        <h2 className="mb-4">Chambres disponibles</h2>

        {chambres.length === 0 ? (
          <p className="text-muted">
            Aucune chambre disponible.
          </p>
        ) : (
          <div className="row">
            {chambres.map((chambre) => (
              <div className="col-md-4 mb-4" key={chambre._id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={
                      chambre.image || "/images/default-chambre.jpg"
                    }
                    alt={chambre.nom}
                    className="card-img-top"
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                    onError={(event) => {
                      event.currentTarget.src =
                        "/images/default-chambre.jpg";
                    }}
                  />

                  <div className="card-body d-flex flex-column">
                    <h5>{chambre.nom}</h5>

                    {chambre.description && (
                      <p>{chambre.description}</p>
                    )}

                    <p>
                      <strong>Prix :</strong>{" "}
                      {chambre.prix} DT / nuit
                    </p>

                    <button
                      className="btn btn-primary mt-auto"
                      onClick={() => ouvrirReservation(chambre)}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Carte */}
      {maison.latitude && maison.longitude && (
        <section className="mt-5">
          <h2 className="mb-3">Localisation</h2>

          <GoogleMapComponent
            latitude={maison.latitude}
            longitude={maison.longitude}
            nom={maison.nom}
          />
        </section>
      )}

      {/* Message de confirmation */}
      {confirmationMessage && (
        <div className="alert alert-success mt-5">
          <h4>Réservation confirmée</h4>

          <p>
            <strong>Chambre :</strong>{" "}
            {confirmationMessage.chambre}
          </p>

          <p>
            <strong>Date d'arrivée :</strong>{" "}
            {confirmationMessage.checkIn}
          </p>

          <p>
            <strong>Date de départ :</strong>{" "}
            {confirmationMessage.checkOut}
          </p>

          <p>
            <strong>Nombre de nuits :</strong>{" "}
            {confirmationMessage.nuits}
          </p>

          <p>
            <strong>Total :</strong>{" "}
            {confirmationMessage.total} DT
          </p>

          <button
            className="btn btn-success"
            onClick={() => navigate("/mes-reservations")}
          >
            Voir mes réservations
          </button>
        </div>
      )}

      {/* Modal de réservation */}
      {chambreSelectionnee && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Réserver : {chambreSelectionnee.nom}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fermerReservation}
                ></button>
              </div>

              <form onSubmit={reserverMaintenant}>
                <div className="modal-body">
                  {erreurDates && (
                    <div className="alert alert-danger">
                      {erreurDates}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Date d'arrivée
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) =>
                        setCheckIn(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Date de départ
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={checkOut}
                      min={
                        checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(event) =>
                        setCheckOut(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Adultes
                      </label>

                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={adultes}
                        onChange={(event) =>
                          setAdultes(Number(event.target.value))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Enfants
                      </label>

                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={enfants}
                        onChange={(event) =>
                          setEnfants(Number(event.target.value))
                        }
                        required
                      />
                    </div>
                  </div>

                  {checkIn &&
                    checkOut &&
                    calculerNuits(checkIn, checkOut) > 0 && (
                      <div className="alert alert-info">
                        <p>
                          <strong>Nuits :</strong>{" "}
                          {calculerNuits(checkIn, checkOut)}
                        </p>

                        <p className="mb-0">
                          <strong>Total :</strong>{" "}
                          {chambreSelectionnee.prix *
                            calculerNuits(checkIn, checkOut)}{" "}
                          DT
                        </p>
                      </div>
                    )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={fermerReservation}
                    disabled={reservationEnCours}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={reservationEnCours}
                  >
                    {reservationEnCours
                      ? "Réservation..."
                      : "Confirmer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaisonDetailPage;
