import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser, getUserRole, onAuthStateChange, signOutUser } from '../lib/auth.js'

function RequireAdmin() {
  const [authState, setAuthState] = useState({
    ready: false,
    user: getCurrentUser(),
    role: null,
  })
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    const unsubscribe = onAuthStateChange((user) => {
      if (cancelled) return
      if (!user) {
        setAuthState({ ready: true, user: null, role: null })
        return
      }
      setAuthState({ ready: false, user })
      getUserRole(user).then((role) => {
        if (!cancelled) setAuthState({ ready: true, user, role })
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  if (!authState.ready) {
    return <div className="auth-status">Checking access...</div>
  }

  if (!authState.user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (!authState.role) {
    return (
      <div className="panel">
        <h1>Access denied</h1>
        <p>You do not have admin access.</p>
        <button type="button" onClick={() => signOutUser()}>
          Logout
        </button>
      </div>
    )
  }

  return <Outlet context={{ role: authState.role }} />
}

export default RequireAdmin
