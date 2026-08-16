import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser, OWNER_UID } from '../../lib/auth.js'
import {
  addDeveloper,
  listDevelopers,
  removeDeveloper,
} from '../../lib/developers.js'

const emptyForm = { uid: '', email: '', displayName: '' }

function DevelopersPage() {
  const owner = getCurrentUser()
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDevelopers(await listDevelopers())
    } catch {
      setError('Failed to load developers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function showNotice(message) {
    setNotice(message)
    setTimeout(() => setNotice(''), 3000)
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAdd(event) {
    event.preventDefault()
    const uid = form.uid.trim()
    const email = form.email.trim()
    if (!uid) {
      setFormError('Firebase Auth UID is required.')
      return
    }
    if (!email || !email.includes('@')) {
      setFormError('A valid email is required.')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      await addDeveloper({ uid, email, displayName: form.displayName.trim() })
      setForm(emptyForm)
      setFormOpen(false)
      await load()
      showNotice('Developer added.')
    } catch {
      setFormError('Failed to add developer.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(developer) {
    if (developer.uid === OWNER_UID) return
    if (!window.confirm(`Remove developer "${developer.displayName || developer.email || developer.uid}"?`)) {
      return
    }
    try {
      await removeDeveloper(developer.uid)
      await load()
      showNotice('Developer removed.')
    } catch {
      setError('Failed to remove developer.')
    }
  }

  const ownerName = owner?.displayName || '—'

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Developers</h1>
          <p className="admin-subtitle">
            <Link to="/admin" className="admin-back">
              ← Back to projects
            </Link>
          </p>
        </div>
      </header>

      <p className="admin-description">
        Manage who can access the admin panel. Only the owner can add or remove
        developers. Developers can manage projects and contact information but
        cannot manage this list.
      </p>

      <div className="admin-toolbar">
        <button type="button" onClick={() => setFormOpen((open) => !open)}>
          {formOpen ? 'Close' : '+ Add Developer'}
        </button>
        {notice && <span className="notice">{notice}</span>}
      </div>

      {formOpen && (
        <form className="project-form developer-form" onSubmit={handleAdd}>
          <fieldset className="form-group">
            <legend>Add developer</legend>
            <label className="field">
              <span>Firebase Auth UID</span>
              <input
                type="text"
                value={form.uid}
                onChange={(event) => setField('uid', event.target.value)}
                placeholder="AbCdEf1234567890..."
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="text"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="developer@example.com"
              />
            </label>
            <label className="field">
              <span>Display name (optional)</span>
              <input
                type="text"
                value={form.displayName}
                onChange={(event) => setField('displayName', event.target.value)}
                placeholder="Ahmed"
              />
            </label>
            {formError && <p className="error">{formError}</p>}
            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add developer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm)
                  setFormError('')
                  setFormOpen(false)
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      )}

      {loading && <p className="muted">Loading developers...</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-scroll">
          <table className="projects-table developers-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>UID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="owner-row">
                <td>
                  <span className="role-badge role-owner">Owner</span>
                </td>
                <td className="mono">{OWNER_UID}</td>
                <td>{owner?.email || '—'}</td>
                <td>{ownerName}</td>
                <td>—</td>
                <td>
                  <span className="muted">—</span>
                </td>
              </tr>
              {developers.map((developer) => (
                <tr key={developer.uid}>
                  <td>
                    <span className="role-badge">Developer</span>
                  </td>
                  <td className="mono">{developer.uid}</td>
                  <td>{developer.email || '—'}</td>
                  <td>{developer.displayName || '—'}</td>
                  <td>{developer.createdAt ? new Date(developer.createdAt.toDate ? developer.createdAt.toDate() : developer.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      onClick={() => handleRemove(developer)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {developers.length === 0 && (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No developers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DevelopersPage
