import { getCurrentUser, signOutUser } from '../../lib/auth.js'

function AdminPage() {
  const user = getCurrentUser()

  return (
    <div className="panel">
      <h1>AnyDesire Admin</h1>
      <p>Admin area</p>
      <p>{user?.email}</p>
      <button type="button" onClick={() => signOutUser()}>
        Logout
      </button>
      <p>Project management will be added next.</p>
    </div>
  )
}

export default AdminPage
