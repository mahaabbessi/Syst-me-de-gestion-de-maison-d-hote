import { Link } from "react-router-dom";

export default function AboutSection() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">

        {/* TEXTE GAUCHE */}
        <div className="lg:w-1/2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500 text-sm font-semibold uppercase tracking-widest">
              About Us
            </span>
            <div className="w-12 h-0.5 bg-yellow-500"></div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-5">
            Bienvenue chez{" "}
            <span className="text-yellow-500 uppercase">DarHôtes</span>
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            DarHôtes est la plateforme tunisienne dédiée aux maisons d'hôtes
            authentiques. Nous connectons les voyageurs en quête d'expériences
            genuines avec des propriétaires passionnés qui perpétuent l'art
            de l'hospitalité traditionnelle à travers toute la Tunisie.
          </p>

          {/* STATS — exactement comme Hotelier */}
          <div className="grid grid-cols-3 gap-4 mb-8">

            <div className="border border-gray-200 rounded p-1">
              <div className="border border-gray-200 rounded text-center py-5 px-2">
                <svg className="w-8 h-8 text-yellow-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22v-2H1v2zM3 7v8h4V7H3zm6 0v8h4V7H9zm6 0v8h4V7h-4zM12 1L2 6h20L12 1z"/>
                </svg>
                <h2 className="text-3xl font-bold text-gray-900">120+</h2>
                <p className="text-gray-500 text-sm mt-1">Maisons</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-1">
              <div className="border border-gray-200 rounded text-center py-5 px-2">
                <svg className="w-8 h-8 text-yellow-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <h2 className="text-3xl font-bold text-gray-900">450+</h2>
                <p className="text-gray-500 text-sm mt-1">Chambres</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-1">
              <div className="border border-gray-200 rounded text-center py-5 px-2">
                <svg className="w-8 h-8 text-yellow-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <h2 className="text-3xl font-bold text-gray-900">2400+</h2>
                <p className="text-gray-500 text-sm mt-1">Clients</p>
              </div>
            </div>

          </div>

          {/* BOUTON */}
          <Link
            to="/maisons"
            className="bg-yellow-500 text-white font-semibold uppercase tracking-wider px-10 py-4 hover:bg-yellow-600 transition-all inline-block"
          >
            Explorer plus
          </Link>

        </div>

        {/* IMAGES DROITE — décalage comme Hotelier */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"
            className="w-full h-52 object-cover rounded mt-16"
          />
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600"
            className="w-full h-64 object-cover rounded"
          />
          <img
            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600"
            className="w-full h-40 object-cover rounded"
          />
          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"
            className="w-full h-52 object-cover rounded"
          />
        </div>

      </div>
    </div>
  );
}