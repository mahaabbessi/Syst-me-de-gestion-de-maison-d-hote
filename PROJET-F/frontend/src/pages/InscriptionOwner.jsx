import { useState } from 'react'
import { register } from '../services/api'

function InscriptionOwner() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'owner'
  })
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
      const res = await register(formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      alert('Compte owner créé ✅')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 p-md-5" style={{ maxWidth: '420px', width: '100%' }}>

        <h2 className="text-center fw-bold mb-1">Créer un compte</h2>
        <p className="text-center text-muted mb-4">Inscription Owner</p>

        {error && (
          <div className="alert alert-danger py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted">Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Mohamed Saidi"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mohamed@gmail.com"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 cars, 1 majuscule, 1 chiffre"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted">Confirmer mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-control"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted">Téléphone (optionnel)</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0698765432"
              className="form-control"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success w-100 py-2 mb-3"
          >
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-muted small mb-0">
          Déjà un compte ?{' '}
          <a href="/" className="text-primary text-decoration-none fw-semibold">
            Se connecter
          </a>
        </p>

      </div>
    </div>
  )
}

export default InscriptionOwner


