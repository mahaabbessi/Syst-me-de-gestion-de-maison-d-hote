import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

export const AUTH_CHANGE_EVENT = 'auth:change';

export default function Navbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const updateUserState = useCallback(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const isValidToken =
      token &&
      token !== 'undefined' &&
      token !== 'null' &&
      token.trim().length > 0;

    setIsLoggedIn(!!isValidToken);
    setUserRole(isValidToken ? role : null);
  }, []);

  useEffect(() => {
    updateUserState();
    window.addEventListener(AUTH_CHANGE_EVENT, updateUserState);
    window.addEventListener('storage', updateUserState);
    window.addEventListener('focus', updateUserState);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, updateUserState);
      window.removeEventListener('storage', updateUserState);
      window.removeEventListener('focus', updateUserState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateUserState]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setMenuOpen(false);
    navigate('/login');
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Barre info */}
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:info@example.com" className="text-gray-600 hover:text-yellow-500 flex items-center gap-1 transition-colors">
              <span className="text-yellow-500">✉</span> info@example.com
            </a>
            <a href="tel:+21671123456" className="text-gray-600 hover:text-yellow-500 flex items-center gap-1 transition-colors">
              <span className="text-yellow-500">📞</span> +216 71 123 456
            </a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`bg-gray-900 text-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">

            {/* Logo - DarHôte */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl font-bold text-yellow-500">DarHôte</span>
            </Link>

            {/* Hamburger mobile */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-6">

              {/* Admin uniquement si role === "admin" */}
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors">
                  🛡️ Admin
                </Link>
              )}

              {isLoggedIn && userRole === 'owner' && (
                <>
                  <Link to="/mes-maisons" className="hover:text-yellow-500 font-semibold transition-colors">
                    📊 Mon Dashboard
                  </Link>
                  <Link to="/ajouter-maison" className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                    + Ajouter
                  </Link>
                </>
              )}

              {isLoggedIn && userRole === 'client' && (
                <>
                  <Link to="/" className="hover:text-yellow-500 transition-colors">Accueil</Link>
                  <Link to="/maisons" className="hover:text-yellow-500 transition-colors">Maisons</Link>
                  <Link to="/mes-reservations" className="hover:text-yellow-500 transition-colors">📅 Mes Réservations</Link>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <Link to="/" className="hover:text-yellow-500 transition-colors">Accueil</Link>
                  <Link to="/maisons" className="hover:text-yellow-500 transition-colors">Maisons</Link>
                </>
              )}

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-semibold">
                    Déconnexion
                  </button>
                ) : (
                  <Link to="/login" className="bg-yellow-500 text-gray-900 px-5 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Menu mobile */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-4 mt-4 border-t border-gray-700 flex flex-col gap-1">

              {/* Admin uniquement si role === "admin" */}
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors text-center">
                  🛡️ Admin
                </Link>
              )}

              {isLoggedIn && userRole === 'owner' && (
                <>
                  <Link to="/mes-maisons" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                    📊 Mon Dashboard
                  </Link>
                  <Link to="/ajouter-maison" onClick={closeMenu} className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg text-center font-semibold hover:bg-yellow-600 transition-colors mt-1">
                    + Ajouter
                  </Link>
                </>
              )}

              {isLoggedIn && userRole === 'client' && (
                <>
                  <Link to="/" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">Accueil</Link>
                  <Link to="/maisons" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">Maisons</Link>
                  <Link to="/mes-reservations" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">📅 Mes Réservations</Link>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <Link to="/" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">Accueil</Link>
                  <Link to="/maisons" onClick={closeMenu} className="hover:text-yellow-500 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">Maisons</Link>
                </>
              )}

              <div className="pt-2 mt-1 border-t border-gray-700">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-semibold">
                    Déconnexion
                  </button>
                ) : (
                  <Link to="/login" onClick={closeMenu} className="block bg-yellow-500 text-gray-900 px-5 py-2 rounded-lg text-center font-semibold hover:bg-yellow-600 transition-colors">
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}