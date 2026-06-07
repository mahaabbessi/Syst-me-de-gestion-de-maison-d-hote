import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from "lucide-react";

export default function WeatherWidget({ ville }) {
  const [meteo, setMeteo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ville) return;

    const fetchMeteo = async () => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        
        // ✅ CORRECTION : Formater le nom de la ville
        const villeFormatee = ville.charAt(0).toUpperCase() + ville.slice(1).toLowerCase();
        
        console.log("🌤️ Ville originale:", ville);
        console.log("🌤️ Ville formatée:", villeFormatee);
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${villeFormatee},TN&appid=${API_KEY}&units=metric&lang=fr`;
        
        console.log("🌤️ URL:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          // Essayer sans le code pays
          const url2 = `https://api.openweathermap.org/data/2.5/weather?q=${villeFormatee}&appid=${API_KEY}&units=metric&lang=fr`;
          const response2 = await fetch(url2);
          if (!response2.ok) throw new Error("Météo non disponible");
          const data = await response2.json();
          setMeteo(data);
        } else {
          const data = await response.json();
          setMeteo(data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur météo:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMeteo();
  }, [ville]);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      Clear: <Sun className="w-8 h-8 text-yellow-500" />,
      Clouds: <Cloud className="w-8 h-8 text-gray-500" />,
      Rain: <CloudRain className="w-8 h-8 text-blue-500" />,
      Snow: <CloudSnow className="w-8 h-8 text-blue-300" />
    };
    return iconMap[condition] || <Sun className="w-8 h-8 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-gray-400">Chargement météo...</p>
      </div>
    );
  }

  if (error || !meteo) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-gray-400">🌤️ Météo non disponible pour {ville}</p>
      </div>
    );
  }

  const weatherCondition = meteo.weather?.[0]?.main;
  const temperature = Math.round(meteo.main?.temp);
  const description = meteo.weather?.[0]?.description;
  const humidity = meteo.main?.humidity;
  const windSpeed = Math.round(meteo.wind?.speed * 3.6);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">🌤️ Météo à {ville}</h3>
        {getWeatherIcon(weatherCondition)}
      </div>
      
      <div className="text-center">
        <span className="text-3xl font-bold text-gray-900">{temperature}°C</span>
        <p className="text-gray-500 capitalize">{description}</p>
      </div>
      
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Droplets size={14} /> {humidity}%
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Wind size={14} /> {windSpeed} km/h
        </div>
      </div>
    </div>
  );
}