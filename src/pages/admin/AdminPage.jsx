import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import ProjectForm from '../../components/ProjectForm.jsx'
import { getCurrentUser, signOutUser } from '../../lib/auth.js'
import {
  createProject,
  deleteProject,
  listProjects,
  newProjectId,
  updateProject,
} from '../../lib/projects.js'

function formatDate(date) {
  if (!date) return null
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AdminPage() {
  const user = getCurrentUser()
  const { role } = useOutletContext()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [view, setView] = useState('list')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProjects(await listProjects())
    } catch {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  function showNotice(message) {
    setNotice(message)
    setTimeout(() => setNotice(''), 3000)
  }

  async function handleCreate(projectId, data) {
    try {
      await createProject(projectId, data, user)
      await loadProjects()
      setView('list')
      showNotice('Project created.')
    } catch {
      setError('Failed to create project.')
    }
  }

  async function handleUpdate(project, data) {
    try {
      await updateProject(project.id, data)
      await loadProjects()
      setView('list')
      showNotice('Project updated.')
    } catch {
      setError('Failed to update project.')
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.title}"?`)) return
    try {
      await deleteProject(project.id)
      await loadProjects()
      showNotice('Project deleted.')
    } catch {
      setError('Failed to delete project.')
    }
  }

  if (view !== 'list') {
    if (view.mode === 'add') {
      return (
        <div className="admin-container">
          <ProjectForm
            onCancel={() => setView('list')}
            onSubmit={(data) => handleCreate(view.projectId, data)}
          />
        </div>
      )
    }

    const project = view.project
    return (
      <div className="admin-container">
        <ProjectForm
          initialData={project}
          onCancel={() => setView('list')}
          onSubmit={(data) => handleUpdate(project, data)}
        />
      </div>
    )
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>AnyDesire Admin</h1>
          <p className="admin-subtitle">
            Admin area · {user?.email} ·{' '}
            <span className={`role-badge ${role === 'owner' ? 'role-owner' : ''}`}>
              {role === 'owner' ? 'Owner' : 'Developer'}
            </span>
          </p>
        </div>
        <button type="button" onClick={() => signOutUser()}>
          Logout
        </button>
      </header>

      <div className="admin-toolbar">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setView({ mode: 'add', projectId: newProjectId() })}
        >
          + Add Project
        </button>
        <Link to="/admin/settings" className="admin-link">
          Contact Information
        </Link>
        {role === 'owner' && (
          <Link to="/admin/developers" className="admin-link">
            Developers
          </Link>
        )}
        {notice && <span className="notice">{notice}</span>}
      </div>

      {loading && <p className="muted">Loading projects...</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-scroll">
          <table className="projects-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
              <th>Added By</th>
              <th>Featured</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.status}</td>
                <td>{project.published ? 'Yes' : 'No'}</td>
                <td>
                  {project.createdByName
                    ? `${project.createdByName} · ${formatDate(project.createdAt)}`
                    : `Null${formatDate(project.createdAt) ? ` · ${formatDate(project.createdAt)}` : ''}`}
                </td>
                <td>{project.featured ? 'Yes' : 'No'}</td>
                <td>{project.order}</td>
                <td className="actions">
                  <button
                    type="button"
                    onClick={() => setView({ mode: 'edit', project })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(project)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan="7" className="table-empty">
                  No projects yet.
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

export default AdminPage
