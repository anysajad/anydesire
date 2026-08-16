import { Navigate, Outlet, useOutletContext } from 'react-router-dom'

function RequireOwner() {
  const { role } = useOutletContext()

  if (role !== 'owner') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default RequireOwner
