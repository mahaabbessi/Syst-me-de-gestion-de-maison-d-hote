import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMaison } from "../services/api";

export default function AjouterMaison() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    ville: "",
    description: "",
    photos: [],
    equipements: {
      jardin: false, piscine: false, parking: false, wifi: false,
      climatisation: false, petitDejeuner: false, restaurant: false,
      navetteAeroport: false, chambresFamiliales: false, serviceEtage: false, nonFumeurs: false
    },
    petitDejeuner: "",
    latitude: "",
    longitude: "",
    note: 4
  });

  const [photoUrlInput, setPhotoUrlInput] = useState("");

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
    
    if (form.photos.length === 0) {
      alert("❌ Veuillez ajouter au moins une photo");
      return;
    }
    
    setLoading(true);
    try {
      await createMaison(form);
      alert("Maison ajoutée avec succès !");
      navigate("/mes-maisons");
    } catch (error) {
      alert("Erreur lors de l'ajout");
      setLoading(false);
    }
  };

  // Ajouter une photo depuis l'URL
  const addPhoto = (prepend = false) => {
    const url = photoUrlInput.trim();
    if (!url) {
      alert("Veuillez entrer une URL");
      return;
    }
    
    // Vérifier si l'URL est valide
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      alert("URL invalide. Utilisez http://, https:// ou un chemin local");
      return;
    }
    
    const newPhotos = prepend ? [url, ...form.photos] : [...form.photos, url];
    setForm({ ...form, photos: newPhotos });
    setPhotoUrlInput(""); // Vider l'input
  };

  // Supprimer une photo
  const removePhoto = (index) => {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) });
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
    { key: "nonFumeurs", label: "🚭 Chambres non-fumeurs" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">

        <div className="bg-gray-900 text-white text-center py-10 rounded-xl mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-yellow-500 text-sm tracking-widest uppercase">——</span>
            <span className="text-yellow-500 text-sm tracking-widest uppercase font-semibold">Espace Propriétaire</span>
            <span className="text-yellow-500 text-sm tracking-widest uppercase">——</span>
          </div>
          <h1 className="text-3xl font-bold">Ajouter une Maison d'Hôte</h1>
          <p className="text-gray-400 mt-2">Remplissez les informations de votre nouvel établissement</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Informations générales */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">📋 Informations générales</h2>
            <input type="text" name="nom" placeholder="Nom *" required onChange={handleChange} className="w-full border rounded px-3 py-2 mb-3" />
            <input type="text" name="adresse" placeholder="Adresse *" required onChange={handleChange} className="w-full border rounded px-3 py-2 mb-3" />
            <input type="text" name="ville" placeholder="Ville *" required onChange={handleChange} className="w-full border rounded px-3 py-2 mb-3" />
            <textarea
              name="description"
              rows="6"
              placeholder="Description de la maison..."
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Équipements */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">🛋️ Équipements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipementList.map((eq) => (
                <label key={eq.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.equipements[eq.key]} onChange={() => handleEquipementChange(eq.key)} />
                  <span>{eq.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photos - Ajout par URL */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">📸 Photos</h2>
            
            {/* Input pour ajouter des URLs */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ajouter une photo par URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://exemple.com/photo.jpg ou /images/photo.jpg"
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => addPhoto(false)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                💡 Astuce : Utilisez des URLs d'images (https://...) ou des chemins locaux (/images/...)
              </p>
            </div>

            {/* Photo principale */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">⭐ Photo principale</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de la photo principale"
                  className="flex-1 border rounded px-3 py-2"
                  id="mainPhotoUrl"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = document.getElementById("mainPhotoUrl").value.trim();
                    if (url) {
                      setForm({ ...form, photos: [url, ...form.photos] });
                      document.getElementById("mainPhotoUrl").value = "";
                    }
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Définir
                </button>
              </div>
            </div>

            {/* Aperçu de toutes les photos */}
            {form.photos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Photos ajoutées ({form.photos.length}) :</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Image+non+trouvée";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {idx === 0 ? "⭐ Principale" : `📸 ${idx + 1}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exemples d'URLs */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">📷 Exemples d'URLs :</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p>• https://images.unsplash.com/photo-1566073771259-6a8506099945</p>
                <p>• https://picsum.photos/800/600?random=1</p>
                <p>• /images/maison-default.jpg (chemin local)</p>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">📍 Localisation</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="latitude" placeholder="Latitude ex: 36.8065" onChange={handleChange} className="border rounded px-3 py-2" />
              <input type="text" name="longitude" placeholder="Longitude ex: 10.1815" onChange={handleChange} className="border rounded px-3 py-2" />
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block mb-2">Note (1-5)</label>
            <select name="note" onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 disabled:opacity-50">
            {loading ? "Ajout en cours..." : "Ajouter la maison"}
          </button>
        </form>
      </div>
    </div>
  );
}