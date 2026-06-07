import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'

export default function InscriptionPage() {
  const navigate = useNavigate()

  const [role, setRole] = useState('client')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'client'
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole)
    setFormData({ ...formData, role: selectedRole })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      setLoading(false)
      return
    }

    try {
      const res = await register(formData)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      window.dispatchEvent(new Event('storage'))

      if (res.data.user.role === 'owner') {
        setTimeout(() => navigate('/mes-maisons'), 100)
        alert('Compte propriétaire créé ✅')
      } else {
        setTimeout(() => navigate('/'), 100)
        alert('Compte client créé ')
      }

    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-center mb-2">Créer un compte</h2>
        <p className="text-center text-gray-500 mb-6">Inscription</p>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('client')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === 'client'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
             Client
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('owner')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === 'owner'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Propriétaire
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nom complet"
            value={formData.name}
            onChange={handleChange}
            className={`${inputClass} mb-3 ${role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}`}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputClass} mb-3 ${role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}`}
            required
          />

          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mot de passe (min. 8 caractères)"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} ${role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showPassword ? '' : ''}
            </button>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${inputClass} mb-3 ${role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}`}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Téléphone (optionnel)"
            value={formData.phone}
            onChange={handleChange}
            className={`${inputClass} mb-4 ${role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition disabled:opacity-50 ${
              role === 'client'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading 
              ? 'Inscription...' 
              : role === 'client' 
                ? 'Créer mon compte client' 
                : 'Créer mon compte propriétaire'
            }
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className={`font-semibold ${role === 'client' ? 'text-blue-600' : 'text-purple-600'}`}>
            Se connecter
          </Link>
        </p>

        {role === 'owner' && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-purple-600">
              💡 En tant que propriétaire, vous pourrez publier et gérer vos maisons d'hôtes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}