const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M1 21h22v-2H1v2zM3 7v8h4V7H3zm6 0v8h4V7H9zm6 0v8h4V7h-4zM12 1L2 6h20L12 1z"/>
      </svg>
    ),
    title: "Chambres & Appartements",
    desc: "Des chambres soigneusement décorées alliant authenticité et confort contemporain.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-3.5-3.47-5.11-7.3-5.11-3.34 0-7.03 1.46-7.03 5.11v1h14.33v-1z"/>
      </svg>
    ),
    title: "Food & Restaurant",
    desc: "Petit-déjeuner traditionnel tunisien et cuisine locale préparée avec amour.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    title: "Spa & Fitness",
    desc: "Hammam, massages aux huiles d'argan et soins beauté dans la tradition locale.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 13.5 5 13.5 8.5 15.1 8.5 17 6.9 20.5 5 20.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V11c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 11c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 16.2V21h2v-5.5l-3.2-3.2 1-1z"/>
      </svg>
    ),
    title: "Sports & Gaming",
    desc: "Profitez de nos installations sportives et de nos activités de loisirs.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
    ),
    title: "Event & Party",
    desc: "Organisation de mariages, anniversaires et événements dans un cadre idyllique.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
        <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
      </svg>
    ),
    title: "GYM & Yoga",
    desc: "Séances de yoga au lever du soleil avec vue sur la mer ou la nature.",
  },
];

export default function ServicesSections() {
  return (
    <div className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* TITRE */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-0.5 bg-yellow-500"></div>
            <span className="text-yellow-500 text-sm font-semibold uppercase tracking-widest">
              Our Services
            </span>
            <div className="w-10 h-0.5 bg-yellow-500"></div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            Explorez nos <span className="text-yellow-500 uppercase">Services</span>
          </h2>
        </div>

        {/* GRILLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-8 bg-white shadow-md hover:bg-yellow-500 transition-all duration-300 cursor-pointer"
            >
              {/* ICÔNE double bordure */}
              <div className="w-20 h-20 border border-yellow-500 group-hover:border-white flex items-center justify-center mb-6 transition-all duration-300">
                <div className="w-16 h-16 border border-yellow-500 group-hover:border-white flex items-center justify-center transition-all duration-300">
                  <div className="group-hover:[&>svg]:text-white transition-all duration-300">
                    {service.icon}
                  </div>
                </div>
              </div>

              <h5 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-all duration-300">
                {service.title}
              </h5>
              <p className="text-gray-500 group-hover:text-white text-sm leading-relaxed transition-all duration-300">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}