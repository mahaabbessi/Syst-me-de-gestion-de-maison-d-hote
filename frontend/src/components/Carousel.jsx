

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ✅ Remplacez ici les URLs Unsplash par vos images locales
const slides = [
  {
    bg: "/images/image4.jpg",
    title: "Découvrez nos Maisons d'Hôtes",
    subtitle: "Luxury Living",
  },
  {
    bg: "/images/image1.jpg",
    title: "Une Expérience Authentique Tunisienne",
    subtitle: "Luxury Living",
  },
  {
    bg: "/images/maison1.jpg",
    title: "Confort et Hospitalité Traditionnelle",
    subtitle: "Luxury Living",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  // Auto slide toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">

      {/* SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* IMAGE */}
          <img
            src={slide.bg}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* OVERLAY sombre comme Hotelier */}
          <div className="absolute inset-0 bg-gray-900/70" />

          {/* CONTENU centré */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h6 className="text-yellow-400 text-sm font-semibold uppercase tracking-[.2em] mb-4">
              {slide.subtitle}
            </h6>
            <h1 className="text-white text-4xl lg:text-6xl font-bold mb-6 max-w-3xl leading-tight">
              {slide.title}
            </h1>
            <div className="flex gap-4">
              <Link
                to="/maisons"
                className="bg-yellow-400 text-gray-900 font-semibold uppercase tracking-wider px-8 py-3 hover:bg-yellow-500 transition-all"
              >
                Nos Maisons
              </Link>
              <Link
                to="/maisons"
                className="bg-white text-gray-900 font-semibold uppercase tracking-wider px-8 py-3 hover:bg-gray-100 transition-all"
              >
                Réserver
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* BOUTON PRÉCÉDENT */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-yellow-400 text-white hover:text-gray-900 flex items-center justify-center transition-all z-10 text-xl"
      >
        ‹
      </button>

      {/* BOUTON SUIVANT */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-yellow-400 text-white hover:text-gray-900 flex items-center justify-center transition-all z-10 text-xl"
      >
        ›
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? "bg-yellow-400 w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>

    </div>
  );
}