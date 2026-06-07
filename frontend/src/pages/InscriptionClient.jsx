import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'

function InscriptionClient() {
  const navigate = useNavigate()

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    try {
      const res = await register(formData)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      window.dispatchEvent(new Event('storage'))

      setTimeout(() => navigate('/'), 100)
      alert('Compte client créé ✅')

    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-center mb-2">Créer un compte</h2>
        <p className="text-center text-gray-500 mb-6">Inscription Client</p>

        {error && <div className="text-red-500 mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Nom complet"
            onChange={handleChange} className={inputClass + " mb-3"} required />

          <input type="email" name="email" placeholder="Email"
            onChange={handleChange} className={inputClass + " mb-3"} required />

          <div className="relative mb-3">
            <input type={showPassword ? 'text' : 'password'}
              name="password" placeholder="Mot de passe"
              onChange={handleChange} className={inputClass} required />
            <span onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 cursor-pointer">
             
            </span>
          </div>

          <input type="password" name="confirmPassword"
            placeholder="Confirmer mot de passe"
            onChange={handleChange}
            className={inputClass + " mb-3"} required />

          <input type="text" name="phone"
            placeholder="Téléphone"
            onChange={handleChange}
            className={inputClass + " mb-3"} />

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default InscriptionClient