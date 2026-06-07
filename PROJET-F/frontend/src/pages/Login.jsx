import { useState } from 'react'
import { signin } from '../services/api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const res = await signin(formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      alert(`Connecté en tant que ${res.data.role} ✅`)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 p-md-5" style={{ maxWidth: '420px', width: '100%' }}>

        <h2 className="text-center fw-bold mb-1">Welcome Back</h2>
        <p className="text-center text-muted mb-4">
          Connectez-vous à votre compte
        </p>

        {error && (
          <div className="alert alert-danger py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ahmed@gmail.com"
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
              placeholder="••••••••"
              className="form-control"
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="remember" />
              <label className="form-check-label text-muted" htmlFor="remember">
                Remember me
              </label>
            </div>
            <a href="#" className="text-primary text-decoration-none small">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 mb-3"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-muted small mb-0">
          Pas de compte ?{' '}
          <a href="/inscription/client" className="text-primary text-decoration-none fw-semibold">
            Inscription Client
          </a>
          {' '}ou{' '}
          <a href="/inscription/owner" className="text-primary text-decoration-none fw-semibold">
            Inscription Owner
          </a>
        </p>

      </div>
    </div>
  )
}

export default Login