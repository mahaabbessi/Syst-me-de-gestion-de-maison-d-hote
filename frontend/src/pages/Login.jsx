import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signin } from '../services/api'
import { AUTH_CHANGE_EVENT } from '../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signin(formData)

      console.log("Reponse complete:", res.data)

      const token = res.data.token
      const user  = res.data.user
      const role  = user?.role

      if (!token) {
        setError("Token manquant dans la reponse du serveur")
        return
      }

      // Sauvegarde dans localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify(user))

      // Notifie la navbar
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
      window.scrollTo(0, 0)

      // Redirection selon le role
      if (role === 'owner') {
        navigate('/mes-maisons')
      } else if (role === 'admin') {
        navigate('/admin-dashboard')
      } else {
        navigate('/')
      }

    } catch (err) {
      console.error("Erreur:", err)
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Bienvenue</h2>
        <p className="text-center text-gray-500 mb-6">Connectez-vous a votre compte</p>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              placeholder="exemple@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-500">Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Entrez votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 rounded-lg transition mb-4 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* UN SEUL LIEN VERS L'INSCRIPTION */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-yellow-600 font-semibold hover:underline">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}