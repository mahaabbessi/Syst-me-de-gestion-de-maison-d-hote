import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Bed, Plus, Edit, Trash2, ArrowLeft, Save, X } from "lucide-react";

export default function GestionChambresPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chambres, setChambres] = useState([]);
  const [maison, setMaison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingChambre, setEditingChambre] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    capacite: 2,
    prix: "",
    description: "",
    photos: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log("🔍 Vérification token:", token ? "Présent" : "Absent");
    console.log("🔍 Vérification rôle:", role);
    
    if (!token || role !== "owner") {
      console.log("❌ Redirection vers login");
      navigate("/login");
      return;
    }

    // Récupérer les infos de la maison
    fetch(`http://localhost:5000/api/maisons/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Maison non trouvée");
        return res.json();
      })
      .then(data => {
        console.log("✅ Maison chargée:", data.nom);
        setMaison(data);
      })
      .catch(err => {
        console.error("❌ Erreur maison:", err);
        setError(err.message);
      });

    // Récupérer les chambres
    fetch(`http://localhost:5000/api/chambres/maison/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur chargement chambres");
        return res.json();
      })
      .then(data => {
        console.log("✅ Chambres chargées:", data.length);
        setChambres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Erreur chambres:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingChambre 
      ? `http://localhost:5000/api/chambres/${editingChambre._id}`
      : `http://localhost:5000/api/chambres/maison/${id}`;
    
    const method = editingChambre ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      const data = await res.json();
      
      if (editingChambre) {
        setChambres(chambres.map(c => c._id === data._id ? data : c));
      } else {
        setChambres([...chambres, data]);
      }
      
      setShowModal(false);
      setEditingChambre(null);
      setFormData({ nom: "", capacite: 2, prix: "", description: "", photos: [] });
      alert(editingChambre ? "Chambre modifiée !" : "Chambre ajoutée !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (chambreId) => {
    if (window.confirm("Supprimer cette chambre ?")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/chambres/${chambreId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erreur suppression");
        setChambres(chambres.filter(c => c._id !== chambreId));
        alert("Chambre supprimée");
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">❌ {error}</p>
          <Link to="/mes-maisons" className="text-yellow-500 hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!maison) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Maison non trouvée</p>
          <Link to="/mes-maisons" className="text-yellow-500 hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link 
              to="/mes-maisons" 
              className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1 mb-2"
            >
              <ArrowLeft size={18} />
              Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des chambres
            </h1>
            <p className="text-gray-500 mt-1">
              {maison.nom} - {maison.adresse}, {maison.ville}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingChambre(null);
              setFormData({ nom: "", capacite: 2, prix: "", description: "", photos: [] });
              setShowModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter une chambre
          </button>
        </div>

        {/* Liste des chambres */}
        {chambres.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune chambre</h3>
            <p className="text-gray-500 mb-6">
              Ajoutez votre première chambre pour "{maison.nom}"
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
            >
              + Ajouter une chambre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chambres.map((chambre) => (
              <div key={chambre._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={chambre.photos?.[0] || "/images/chambres/default-room.jpg"}
                    alt={chambre.nom}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/images/chambres/default-room.jpg";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    {chambre.prix} DT/nuit
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900">{chambre.nom}</h3>
                  <p className="text-gray-500 text-sm mt-1">👤 Capacité: {chambre.capacite} personnes</p>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {chambre.description || "Aucune description"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingChambre(chambre);
                        setFormData({
                          nom: chambre.nom,
                          capacite: chambre.capacite,
                          prix: chambre.prix,
                          description: chambre.description || "",
                          photos: chambre.photos || []
                        });
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                      <Edit size={16} className="inline mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(chambre._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={16} className="inline mr-1" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingChambre ? "Modifier la chambre" : "Ajouter une chambre"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Nom de la chambre *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Ex: Suite Royale"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Capacité *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Prix (DT/nuit) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.prix}
                        onChange={(e) => setFormData({ ...formData, prix: parseInt(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Description de la chambre..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">URL de la photo</label>
                    <input
                      type="text"
                      value={formData.photos[0] || ""}
                      onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="https://exemple.com/photo.jpg ou /images/maisons/photo.jpg"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                    >
                      {editingChambre ? "Enregistrer" : "Ajouter"}
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