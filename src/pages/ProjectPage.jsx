import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useLanguage } from '../i18n/useLanguage.js'
import { getPublishedProjectBySlug } from '../lib/projects.js'

function ProjectPage() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [project, setProject] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getPublishedProjectBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setProject(data)
        setStatus(data ? 'ready' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setStatus('missing')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <>
      <Navbar />
      <main className="project-page container">
        {status === 'loading' && <p className="muted">{t.work.loading}</p>}

        {status === 'missing' && (
          <div className="notfound">
            <h1>{t.project.notFoundTitle}</h1>
            <p className="muted">{t.project.notFoundText}</p>
            <Link to="/" className="btn">
              {t.project.back}
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <article>
            <Link to="/" className="project-back">
              {t.project.back}
            </Link>
            <h1>{project.title}</h1>
            <div className="project-page-meta">
              {project.category && <span>{project.category}</span>}
              {project.status && (
                <span>{t.project.status[project.status] ?? project.status}</span>
              )}
            </div>
            {project.coverImage && (
              <img
                className="project-page-cover"
                src={project.coverImage}
                alt={project.title}
              />
            )}
            <div className="project-page-body">
              {project.shortDescription && <p>{project.shortDescription}</p>}
              {project.description && <p>{project.description}</p>}
              {project.technologies?.length > 0 && (
                <>
                  <h2 className="section-heading">{t.project.technologies}</h2>
                  <ul className="tags">
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                </>
              )}
              {(project.demoUrl || project.githubUrl) && (
                <div className="hero-actions">
                  {project.demoUrl && (
                    <a
                      className="btn btn-primary"
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.project.links.demo}
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      className="btn"
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.project.links.source}
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  )
}

export default ProjectPage
