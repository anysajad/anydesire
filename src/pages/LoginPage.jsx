import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../lib/auth.js'
import { useLanguage } from '../i18n/useLanguage.js'

function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password, rememberMe)
      const from = location.state?.from?.pathname
      const safeFrom = from?.startsWith('/') && !from.startsWith('//') ? from : null
      navigate(safeFrom || '/admin', { replace: true })
    } catch {
      setError(t.login.invalidCredentials)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <img src="/icon-only.svg" className="panel-icon" alt="" aria-hidden="true" />
      <h1>AnyDesire Admin</h1>
      <form onSubmit={handleSubmit}>
        <label>
          {t.login.email}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          {t.login.password}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="checkbox-field remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          {t.login.rememberMe}
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? t.login.signingIn : t.login.login}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
