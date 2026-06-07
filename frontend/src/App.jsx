import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Sprint 1
import Login             from './pages/Login'
import InscriptionPage from './pages/InscriptionPage'

// Sprint 2
import Navbar             from './components/Navbar'
import Footer             from './components/Footer'
import HomePage           from './pages/HomePage'
import MaisonsPage        from './pages/MaisonsPage'
import MaisonDetailPage   from './pages/MaisonDetailPage'
import GestionMaisonsPage from './pages/GestionMaisonsPage'
import AjouterMaison      from './pages/AjouterMaison'
import ModifierMaison     from './pages/ModifierMaison'

// Sprint 3
import GestionChambresPage from './pages/GestionChambresPage'

// Sprint 4
// 🚀 SUPPRESSION DE L'IMPORT PanierPage
import MesReservationsPage from './pages/MesReservationsPage'

// Admin
import AdminDashboard from './pages/AdminDashboard'

// ── ScrollToTop ──────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ── Protection routes normales ───────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "owner")  return <Navigate to="/mes-maisons" replace />;
    if (role === "client") return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ── Protection route admin ───────────────────────────
const ProtectedAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ── App ──────────────────────────────────────────────
function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null" || token.trim().length === 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>

            {/* ── Pages publiques ── */}
            <Route path="/login"                element={<Login />} />
            <Route path="/inscription" element={<InscriptionPage />} />
            <Route path="/"                     element={<HomePage />} />
            <Route path="/maisons"              element={<MaisonsPage />} />
            <Route path="/maisons/:id"          element={<MaisonDetailPage />} />

            {/* ── Routes OWNER ── */}
            <Route path="/mes-maisons" element={
              <PrivateRoute allowedRoles={["owner"]}>
                <GestionMaisonsPage />
              </PrivateRoute>
            }/>
            <Route path="/ajouter-maison" element={
              <PrivateRoute allowedRoles={["owner"]}>
                <AjouterMaison />
              </PrivateRoute>
            }/>
            <Route path="/modifier-maison/:id" element={
              <PrivateRoute allowedRoles={["owner"]}>
                <ModifierMaison />
              </PrivateRoute>
            }/>
            <Route path="/mes-maisons/:id/chambres" element={
              <PrivateRoute allowedRoles={["owner"]}>
                <GestionChambresPage />
              </PrivateRoute>
            }/>

            {/* ── Routes CLIENT ── */}
            {/* 🚀 SUPPRESSION DE LA ROUTE /mon-panier */}
            <Route path="/mes-reservations" element={
              <PrivateRoute allowedRoles={["client"]}>
                <MesReservationsPage />
              </PrivateRoute>
            }/>

            {/* ── Route ADMIN protégée ── */}
            <Route path="/admin-dashboard" element={
              <ProtectedAdmin>
                <AdminDashboard />
              </ProtectedAdmin>
            }/>

          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App