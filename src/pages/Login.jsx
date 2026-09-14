
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(identifier, password)

      navigate('/profile')
    } catch (loginError) {
      setError(
        loginError.message ||
          'Unable to log in.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">REALM</span>

        <h1>Welcome back.</h1>

        <p className="auth-intro">
          Sign in to continue into your REALM.
        </p>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label>
            Username or email

            <input
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
              placeholder="Username or email"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login

