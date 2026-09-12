import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Bed,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://gestion-maison-hote-backend.onrender.com";

export default function GestionChambresPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chambres, setChambres] = useState([]);
  const [maison, setMaison] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingChambre, setEditingChambre] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    capacite: 2,
    prix: "",
    description: "",
    photos: [],
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const chargerDonnees = async () => {
    const token = getToken();
    const role = localStorage.getItem("role");

    if (!token || role !== "owner") {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const maisonResponse = await fetch(
        `${BACKEND_URL}/api/maisons/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!maisonResponse.ok) {
        throw new Error("Maison non trouvée.");
      }

      const maisonData = await maisonResponse.json();
      setMaison(maisonData);

      const chambresResponse = await fetch(
        `${BACKEND_URL}/api/chambres/maison/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!chambresResponse.ok) {
        const errorData = await chambresResponse.json().catch(() => null);

        throw new Error(
          errorData?.message || "Erreur lors du chargement des chambres."
        );
      }

      const chambresData = await chambresResponse.json();

      setChambres(Array.isArray(chambresData) ? chambresData : []);
    } catch (err) {
      console.error("Erreur chargement données :", err);

      setError(
        err.message ||
          "Failed to fetch. Vérifiez que le backend Render fonctionne."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  const ouvrirAjout = () => {
    setEditingChambre(null);

    setFormData({
      nom: "",
      capacite: 2,
      prix: "",
      description: "",
      photos: [],
    });

    setShowModal(true);
  };

  const ouvrirModification = (chambre) => {
    setEditingChambre(chambre);

    setFormData({
      nom: chambre.nom || "",
      capacite: chambre.capacite || 2,
      prix: chambre.prix || "",
      description: chambre.description || "",
      photos: chambre.photos || [],
    });

    setShowModal(true);
  };

  const fermerModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingChambre(null);

    setFormData({
      nom: "",
      capacite: 2,
      prix: "",
      description: "",
      photos: [],
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "capacite"
          ? Number(value)
          : name === "prix"
          ? value
          : value,
    }));
  };

  const handlePhotoChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      photos: [event.target.value],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.nom.trim()) {
      alert("Veuillez saisir le nom de la chambre.");
      return;
    }

    if (!formData.prix || Number(formData.prix) < 0) {
      alert("Veuillez saisir un prix valide.");
      return;
    }

    try {
      setSaving(true);

      const url = editingChambre
        ? `${BACKEND_URL}/api/chambres/${editingChambre._id}`
        : `${BACKEND_URL}/api/chambres/maison/${id}`;

      const method = editingChambre ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          nom: formData.nom,
          capacite: Number(formData.capacite),
          prix: Number(formData.prix),
          description: formData.description,
          photos: formData.photos,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Erreur lors de l'enregistrement de la chambre."
        );
      }

      if (editingChambre) {
        setChambres((previous) =>
          previous.map((chambre) =>
            chambre._id === data._id ? data : chambre
          )
        );

        alert("Chambre modifiée avec succès !");
      } else {
        setChambres((previous) => [...previous, data]);

        alert("Chambre ajoutée avec succès !");
      }

      fermerModal();
    } catch (err) {
      console.error("Erreur enregistrement chambre :", err);

      alert(
        err.message ||
          "Erreur lors de l'enregistrement. Vérifiez le backend Render."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (chambreId) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette chambre ?"
    );

    if (!confirmation) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDeletingId(chambreId);

      const response = await fetch(
        `${BACKEND_URL}/api/chambres/${chambreId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Erreur lors de la suppression."
        );
      }

      setChambres((previous) =>
        previous.filter((chambre) => chambre._id !== chambreId)
      );

      alert("Chambre supprimée avec succès !");
    } catch (err) {
      console.error("Erreur suppression chambre :", err);

      alert(
        err.message ||
          "Erreur lors de la suppression. Vérifiez le backend Render."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={45}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 text-gray-500">
            Chargement des chambres...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-red-600">❌ {error}</p>

          <button
            type="button"
            onClick={chargerDonnees}
            className="mr-3 rounded-lg bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600"
          >
            Réessayer
          </button>

          <Link
            to="/mes-maisons"
            className="inline-block rounded-lg bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300"
          >
            Retour
          </Link>
        </div>
      </div>
    );
  }

  if (!maison) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">Maison non trouvée.</p>

          <Link
            to="/mes-maisons"
            className="text-yellow-500 hover:underline"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/mes-maisons"
              className="mb-2 flex items-center gap-1 text-yellow-500 hover:text-yellow-600"
            >
              <ArrowLeft size={18} />
              Retour au dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des chambres
            </h1>

            <p className="mt-1 text-gray-500">
              {maison.nom} - {maison.adresse}, {maison.ville}
            </p>
          </div>

          <button
            type="button"
            onClick={ouvrirAjout}
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white hover:bg-yellow-600"
          >
            <Plus size={20} />
            Ajouter une chambre
          </button>
        </div>

        {chambres.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <Bed className="mx-auto mb-4 h-16 w-16 text-gray-300" />

            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Aucune chambre
            </h3>

            <p className="mb-6 text-gray-500">
              Ajoutez votre première chambre pour « {maison.nom} ».
            </p>

            <button
              type="button"
              onClick={ouvrirAjout}
              className="rounded-lg bg-yellow-500 px-6 py-2 text-white hover:bg-yellow-600"
            >
              Ajouter une chambre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {chambres.map((chambre) => (
              <div
                key={chambre._id}
                className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
              >
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={
                      chambre.photos?.[0] ||
                      "/images/chambres/default-room.jpg"
                    }
                    alt={chambre.nom}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src =
                        "/images/chambres/default-room.jpg";
                    }}
                  />

                  <div className="absolute right-3 top-3 rounded-lg bg-yellow-500 px-3 py-1 text-sm font-bold text-white">
                    {chambre.prix} DT/nuit
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {chambre.nom}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    👤 Capacité : {chambre.capacite} personne(s)
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {chambre.description || "Aucune description"}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => ouvrirModification(chambre)}
                      className="flex-1 rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
                    >
                      <Edit size={16} className="mr-1 inline" />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(chambre._id)}
                      disabled={deletingId === chambre._id}
                      className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:opacity-60"
                    >
                      {deletingId === chambre._id ? (
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-1 inline" />
                          Supprimer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingChambre
                      ? "Modifier la chambre"
                      : "Ajouter une chambre"}
                  </h2>

                  <button
                    type="button"
                    onClick={fermerModal}
                    disabled={saving}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="mb-2 block text-gray-700">
                      Nom de la chambre *
                    </label>

                    <input
                      type="text"
                      name="nom"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Ex : Suite Royale"
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-gray-700">
                        Capacité *
                      </label>

                      <input
                        type="number"
                        name="capacite"
                        required
                        min="1"
                        max="10"
                        value={formData.capacite}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-gray-700">
                        Prix DT/nuit *
                      </label>

                      <input
                        type="number"
                        name="prix"
                        required
                        min="0"
                        value={formData.prix}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-gray-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Description de la chambre..."
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-gray-700">
                      URL de la photo
                    </label>

                    <input
                      type="text"
                      value={formData.photos[0] || ""}
                      onChange={handlePhotoChange}
                      placeholder="https://exemple.com/photo.jpg"
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={fermerModal}
                      disabled={saving}
                      className="flex-1 rounded-lg bg-gray-200 py-3 text-gray-700 hover:bg-gray-300 disabled:opacity-60"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 rounded-lg bg-yellow-500 py-3 text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          Enregistrement...
                        </span>
                      ) : editingChambre ? (
                        "Enregistrer"
                      ) : (
                        "Ajouter"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
