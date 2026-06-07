import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMaisonById, updateMaison } from "../services/api";

export default function ModifierMaison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    nom: "", adresse: "", ville: "", description: "",
    photos: [], latitude: "", longitude: "", note: 4,
    equipements: {
      piscine: false, wifi: false, parking: false, climatisation: false,
      petitDejeuner: false, restaurant: false, jardin: false, spa: false,
      navetteAeroport: false, chambresFamiliales: false, serviceEtage: false, nonFumeurs: false
    },
    petitDejeuner: ""
  });

  useEffect(() => {
    getMaisonById(id)
      .then((res) => {
        const maison = res.data;
        setForm({
          nom: maison.nom || "",
          adresse: maison.adresse || "",
          ville: maison.ville || "",
          description: maison.description || "",
          photos: maison.photos || [],
          latitude: maison.latitude || "",
          longitude: maison.longitude || "",
          note: maison.note || 4,
          equipements: maison.equipements || {
            piscine: false, wifi: false, parking: false, climatisation: false,
            petitDejeuner: false, restaurant: false, jardin: false, spa: false,
            navetteAeroport: false, chambresFamiliales: false, serviceEtage: false, nonFumeurs: false
          },
          petitDejeuner: maison.petitDejeuner || ""
        });
        setFetching(false);
      })
      .catch(console.error);
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEquipementChange = (equipement) => {
    setForm({
      ...form,
      equipements: { ...form.equipements, [equipement]: !form.equipements[equipement] }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMaison(id, form);
      alert("Maison modifiée avec succès !");
      navigate("/mes-maisons");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification");
      setLoading(false);
    }
  };

  const addPhoto = (inputId, prepend = false) => {
    const url = document.getElementById(inputId).value.trim();
    if (url) {
      const newPhotos = prepend ? [url, ...form.photos] : [...form.photos, url];
      setForm({ ...form, photos: newPhotos });
      document.getElementById(inputId).value = '';
    }
  };

  const replaceMainPhoto = () => {
    const url = document.getElementById('mainPhotoUrl').value.trim();
    if (url) {
      const newPhotos = [url, ...form.photos.slice(1)];
      setForm({ ...form, photos: newPhotos });
      document.getElementById('mainPhotoUrl').value = '';
    }
  };

  const equipementList = [
    { key: "jardin", label: "🌳 Jardin" },
    { key: "piscine", label: "🏊 Piscine" },
    { key: "parking", label: "🅿️ Parking" },
    { key: "wifi", label: "📶 Wi-Fi gratuit" },
    { key: "climatisation", label: "❄️ Climatisation" },
    { key: "petitDejeuner", label: "🍳 Petit-déjeuner" },
    { key: "restaurant", label: "🍽️ Restaurant" },
    { key: "navetteAeroport", label: "✈️ Navette aéroport" },
    { key: "chambresFamiliales", label: "👨‍👩‍👧‍👦 Chambres familiales" },
    { key: "serviceEtage", label: "🛎️ Service d'étage" },
    { key: "nonFumeurs", label: "🚭 Chambres non-fumeurs" },
    { key: "spa", label: "🧖 Spa" }
  ];

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">

        <div className="bg-gray-900 text-white text-center py-10 rounded-xl mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-yellow-500 text-sm tracking-widest uppercase">——</span>
            <span className="text-yellow-500 text-sm tracking-widest uppercase font-semibold">Espace Propriétaire</span>
            <span className="text-yellow-500 text-sm tracking-widest uppercase">——</span>
          </div>
          <h1 className="text-3xl font-bold">Modifier la Maison d'Hôte</h1>
          <p className="text-gray-400 mt-2">Mettez à jour les informations de votre établissement</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Informations de base */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Nom de la maison *</label>
            <input type="text" name="nom" required value={form.nom} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Adresse *</label>
              <input type="text" name="adresse" required value={form.adresse} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Ville *</label>
              <input type="text" name="ville" required value={form.ville} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          {/* Équipements */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">🛋️ Équipements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipementList.map((eq) => (
                <label key={eq.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.equipements[eq.key] || false} onChange={() => handleEquipementChange(eq.key)} className="w-4 h-4" />
                  <span>{eq.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photo principale */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">🖼️ Photo principale</h2>
            {form.photos[0] && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Photo actuelle :</p>
                <img
                  src={form.photos[0]}
                  alt="Photo principale"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => { e.target.src = "/images/default-house.jpg"; }}
                />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                id="mainPhotoUrl"
                placeholder="Nouvelle URL photo principale"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={replaceMainPhoto}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                {form.photos[0] ? "Changer" : "Ajouter"}
              </button>
            </div>
          </div>

          {/* Photos des espaces */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">📸 Photos des espaces</h2>

            <div className="space-y-3">
              {[
                { id: "jardinUrl", label: "🌳 Jardin", placeholder: "/images/jardin1.jpg" },
                { id: "piscineUrl", label: "🏊 Piscine", placeholder: "/images/piscine1.jpg" },
                { id: "spaUrl", label: "🧖 Spa", placeholder: "/images/spa1.jpg" },
                { id: "restaurantUrl", label: "🍽️ Restaurant", placeholder: "/images/restaurant1.jpg" },
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <div className="flex gap-2">
                    <input type="text" id={id} placeholder={placeholder} className="flex-1 border rounded-lg px-3 py-2" />
                    <button type="button" onClick={() => addPhoto(id)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Aperçu toutes les photos */}
            {form.photos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Toutes les photos ({form.photos.length}) :</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {form.photos.map((photo, idx) => {
                    let label = idx === 0 ? "🖼️ Principale" : "📸";
                    if (idx !== 0) {
                      if (photo.toLowerCase().includes("jardin")) label = "🌳";
                      else if (photo.toLowerCase().includes("piscine")) label = "🏊";
                      else if (photo.toLowerCase().includes("spa")) label = "🧖";
                      else if (photo.toLowerCase().includes("restaurant")) label = "🍽️";
                    }
                    return (
                      <div key={idx} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                          onError={(e) => { e.target.src = "/images/default-house.jpg"; }}
                        />
                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">{label}</div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photos: form.photos.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Latitude</label>
              <input type="text" name="latitude" value={form.latitude} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Ex: 36.8065" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Longitude</label>
              <input type="text" name="longitude" value={form.longitude} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Ex: 10.1815" />
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Note (1-5)</label>
            <select name="note" value={form.note} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/mes-maisons")} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">
              {loading ? "Modification en cours..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}