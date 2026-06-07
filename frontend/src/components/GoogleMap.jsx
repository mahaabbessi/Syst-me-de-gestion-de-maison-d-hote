import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';

export default function GoogleMapComponent({ latitude, longitude, address, name }) {
  const [selected, setSelected] = useState(null);

  // Vérifier que la clé est chargée
  console.log("Clé API:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Afficher l'erreur si la clé est invalide
  if (loadError) {
    console.error("Erreur chargement Google Maps:", loadError);
    return <p className="text-red-500"> Erreur de chargement de Google Maps</p>;
  }

  if (!isLoaded) return <p className="text-gray-500">Chargement de la carte...</p>;

  const center = {
    lat: latitude || 36.8065,
    lng: longitude || 10.1815
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      zoom={14}
      center={center}
    >
      <Marker
        position={center}
        onClick={() => setSelected(center)}
      />

      {selected && (
        <InfoWindow
          position={selected}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <h4 className="font-bold">{name}</h4>
            <p className="text-sm">{address}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}