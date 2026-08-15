import { useCallback, useEffect, useState } from 'react'
import ProjectForm from '../../components/ProjectForm.jsx'
import { getCurrentUser, signOutUser } from '../../lib/auth.js'
import {
  createProject,
  deleteProject,
  listProjects,
  newProjectId,
  updateProject,
} from '../../lib/projects.js'
import { deleteProjectImage } from '../../lib/storage.js'

function collectImagePaths(data) {
  const cover = data.coverImage?.path ? [data.coverImage.path] : []
  const screenshots = (data.screenshots ?? [])
    .map((screenshot) => screenshot?.path)
    .filter(Boolean)
  return [...cover, ...screenshots]
}

function AdminPage() {
  const user = getCurrentUser()
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
    setTimeout(() => setNotice(''), 4000)
  }

  async function cleanupImages(paths) {
    const results = await Promise.allSettled(paths.map((path) => deleteProjectImage(path)))
    return paths.filter((_, index) => results[index].status === 'rejected')
  }

  async function handleCreate(projectId, data) {
    try {
      await createProject(projectId, data)
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
      const oldPaths = collectImagePaths(project)
      const newPaths = collectImagePaths(data)
      const toDelete = oldPaths.filter((path) => !newPaths.includes(path))
      const failed = await cleanupImages(toDelete)
      showNotice(
        failed.length > 0
          ? 'Project updated, but some old images could not be deleted.'
          : 'Project updated.',
      )
    } catch {
      setError('Failed to update project.')
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.title}"?`)) return
    try {
      const failed = await cleanupImages(collectImagePaths(project))
      await deleteProject(project.id)
      await loadProjects()
      showNotice(
        failed.length > 0
          ? 'Project deleted, but some images could not be removed.'
          : 'Project deleted.',
      )
    } catch {
      setError('Failed to delete project.')
    }
  }

  if (view !== 'list') {
    if (view.mode === 'add') {
      return (
        <div className="admin-container">
          <h1>New Project</h1>
          <ProjectForm
            projectId={view.projectId}
            onCancel={() => setView('list')}
            onSubmit={(data) => handleCreate(view.projectId, data)}
          />
        </div>
      )
    }

    const project = view.project
    return (
      <div className="admin-container">
        <h1>Edit Project</h1>
        <ProjectForm
          projectId={project.id}
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
          <p className="admin-subtitle">Admin area · {user?.email}</p>
        </div>
        <button type="button" onClick={() => signOutUser()}>
          Logout
        </button>
      </header>

      <div className="admin-toolbar">
        <button type="button" onClick={() => setView({ mode: 'add', projectId: newProjectId() })}>
          + Add Project
        </button>
        {notice && <span className="notice">{notice}</span>}
      </div>

      {loading && <p className="muted">Loading projects...</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="projects-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
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
                    onClick={() => handleDelete(project)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan="6" className="muted">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminPage
