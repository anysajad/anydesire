import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../i18n/useLanguage.js'
import { listPublishedProjects } from '../../lib/projects.js'

function SelectedWork() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    listPublishedProjects()
      .then((data) => {
        if (!cancelled) setProjects(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const orderedProjects = [
    ...projects.filter((project) => project.featured),
    ...projects.filter((project) => !project.featured),
  ]

  return (
    <section id="work" className="section">
      <div className="container">
        <h2 className="section-heading">{t.work.heading}</h2>

        {loading && <p className="muted">{t.work.loading}</p>}
        {!loading && error && <p className="muted">Error</p>}
        {!loading && !error && orderedProjects.length === 0 && (
          <div className="empty-state">{t.work.empty}</div>
        )}

        {!loading && !error && orderedProjects.length > 0 && (
          <div className="work-grid">
            {orderedProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="project-card"
              >
                {project.coverImage && (
                  <img
                    className="project-card-cover"
                    src={project.coverImage}
                    alt={project.title}
                    loading="lazy"
                  />
                )}
                <div className="project-card-body">
                  <div className="project-card-meta">
                    {project.featured && <span className="badge">{t.work.featured}</span>}
                    {project.category && <span className="muted">{project.category}</span>}
                    {project.status && (
                      <span className="muted">
                        {t.project.status[project.status] ?? project.status}
                      </span>
                    )}
                  </div>
                  <h3 className="project-card-title">{project.title}</h3>
                  {project.shortDescription && (
                    <p className="muted">{project.shortDescription}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <ul className="tags">
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SelectedWork
