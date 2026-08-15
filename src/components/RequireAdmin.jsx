import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  getCurrentUser,
  isAdmin,
  onAuthStateChange,
  signOutUser,
} from '../lib/auth.js'

function RequireAdmin() {
  const [authState, setAuthState] = useState({ ready: false, user: getCurrentUser() })
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setAuthState({ ready: true, user })
    })
    return unsubscribe
  }, [])

  if (!authState.ready) {
    return <div className="auth-status">Checking access...</div>
  }

  if (!authState.user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (!isAdmin(authState.user)) {
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

  return <Outlet />
}

export default RequireAdmin
