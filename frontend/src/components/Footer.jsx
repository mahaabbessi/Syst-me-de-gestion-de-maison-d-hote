import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="bg-gray-900 text-white">

      {/* NEWSLETTER */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="border border-gray-700 rounded p-1">
          <div className="border border-gray-700 rounded text-center py-10 px-6">
            <h4 className="text-xl font-bold mb-6">
              Abonnez-vous à notre{" "}
              <span className="text-yellow-500 uppercase">Newsletter</span>
            </h4>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 outline-none focus:border-yellow-500"
              />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 transition-all uppercase text-sm">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* LOGO */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-500 rounded p-5">
              <Link to="/">
                <h1 className="text-white text-2xl font-bold uppercase mb-3">
                  DarHôtes
                </h1>
              </Link>
              <p className="text-white text-sm leading-relaxed opacity-90">
                La plateforme tunisienne de référence pour la découverte
                et la réservation des plus belles maisons d'hôtes authentiques.
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h6 className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-5">
              Contact
            </h6>
            <p className="text-gray-400 text-sm mb-3">📍 12 Rue de la Médina, Tunis 1001</p>
            <p className="text-gray-400 text-sm mb-3">📞 +216 71 123 456</p>
            <p className="text-gray-400 text-sm mb-5">✉️ contact@darhotes.tn</p>
            <div className="flex gap-2">
              {["f", "tw", "in", "yt"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 border border-gray-600 flex items-center justify-center text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-all text-xs font-bold uppercase"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h6 className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-5">
              Navigation
            </h6>
            {[
              { label: "Accueil",     to: "/" },
              { label: "Nos Maisons", to: "/maisons" },
              { label: "Connexion",   to: "/login" },
              { label: "Inscription", to: "/inscription/client" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 text-sm mb-3 transition-all"
              >
                › {link.label}
              </Link>
            ))}
          </div>

          {/* SERVICES */}
          <div>
            <h6 className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-5">
              Services
            </h6>
            {[
              "Chambres & Appartements",
              "Restauration",
              "Spa & Bien-être",
              "Événements",
              "Yoga & Méditation",
            ].map((s) => (
              <a
                key={s}
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 text-sm mb-3 transition-all"
              >
                › {s}
              </a>
            ))}
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-sm">
            © 2025 <span className="text-yellow-500">DarHôtes</span>
          </p>
          <div className="flex gap-4">
            {["Accueil", "CGU", "Confidentialité", "FAQ"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-400 hover:text-yellow-500 text-sm transition-all"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}