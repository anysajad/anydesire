import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useLanguage } from '../i18n/useLanguage.js'
import { usePageMeta } from '../i18n/usePageMeta.js'
import { getPublishedProjectBySlug, listPublishedProjects } from '../lib/projects.js'

function ProjectPage() {
  const { slug } = useParams()
  const { t, language } = useLanguage()
  const [status, setStatus] = useState('loading')
  const [project, setProject] = useState(null)
  const [prevProject, setPrevProject] = useState(null)
  const [nextProject, setNextProject] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    Promise.all([getPublishedProjectBySlug(slug), listPublishedProjects()])
      .then(([project, projects]) => {
        if (cancelled) return
        if (!project) {
          setStatus('missing')
          return
        }
        const index = projects.findIndex((item) => item.id === project.id)
        setPrevProject(index > 0 ? projects[index - 1] : null)
        setNextProject(index >= 0 && index < projects.length - 1 ? projects[index + 1] : null)
        setProject(project)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (lightbox === null) return
    const screens = project?.screenshots ?? []
    const move = (delta) =>
      setLightbox((current) => (current + delta + screens.length) % screens.length)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightbox(null)
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightbox, project])

  const title = language === 'ar' ? project?.titleAr || project?.title : project?.title || project?.titleAr
  const shortDescription =
    language === 'ar'
      ? project?.shortDescriptionAr || project?.shortDescription
      : project?.shortDescription || project?.shortDescriptionAr
  const description =
    language === 'ar'
      ? project?.descriptionAr || project?.description
      : project?.description || project?.descriptionAr
  const paragraphs = description
    ? description.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : []
  const screenshots = project?.screenshots ?? []
  const features = project?.features ?? []

  usePageMeta(
    project ? `${title} — AnyDesire` : t.meta.title,
    project ? shortDescription : t.meta.description,
    project?.coverImage || null,
  )

  const currentScreenshot = lightbox !== null ? screenshots[lightbox] : null

  return (
    <>
      <Navbar />
      <main className="project-page container">
        <Link to="/#work" className="project-back">
          {t.project.back}
        </Link>

        {status === 'loading' && <p className="muted">{t.work.loading}</p>}
        {status === 'error' && <p className="muted">{t.project.error}</p>}

        {status === 'missing' && (
          <div className="notfound">
            <h1>{t.project.notFoundTitle}</h1>
            <p className="muted">{t.project.notFoundText}</p>
            <Link to="/" className="btn">
              {t.project.back}
            </Link>
          </div>
        )}

        {status === 'ready' && project && (
          <article>
            <header className="project-header">
              <div className="project-header-meta">
                {project.featured && <span className="badge">{t.work.featured}</span>}
                {project.category && <span className="muted">{project.category}</span>}
                {project.status && (
                  <span className="muted">{t.project.status[project.status] ?? project.status}</span>
                )}
              </div>
              <h1>{title}</h1>
              {shortDescription && <p className="project-lead">{shortDescription}</p>}
              {project.technologies?.length > 0 && (
                <ul className="tags">
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              )}
              {(project.demoUrl || project.githubUrl) && (
                <div className="project-links">
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
                    <a className="btn" href={project.githubUrl} target="_blank" rel="noreferrer">
                      {t.project.links.github}
                    </a>
                  )}
                </div>
              )}
            </header>

            {project.coverImage && (
              <img className="project-cover" src={project.coverImage} alt={title} loading="lazy" />
            )}

            {paragraphs.length > 0 && (
              <section className="project-description">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>
            )}

            {features.length > 0 && (
              <section className="project-features">
                <h2 className="section-heading">{t.project.features}</h2>
                <ol className="features">
                  {features.map((feature, index) => (
                    <li key={index}>
                      <span className="features-num">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {screenshots.length > 0 && (
              <section className="project-gallery">
                <h2 className="section-heading">{t.project.gallery}</h2>
                <button
                  type="button"
                  className="gallery-featured"
                  onClick={() => setLightbox(0)}
                  aria-label={`${title} 1`}
                >
                  <img src={screenshots[0]} alt={`${title} 1`} loading="lazy" />
                </button>
                {screenshots.length > 1 && (
                  <div className="gallery-grid">
                    {screenshots.slice(1).map((src, index) => (
                      <button
                        type="button"
                        className="gallery-item"
                        key={index}
                        onClick={() => setLightbox(index + 1)}
                        aria-label={`${title} ${index + 2}`}
                      >
                        <img src={src} alt={`${title} ${index + 2}`} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <dl className="project-info">
              {project.category && (
                <div>
                  <dt>{t.project.category}</dt>
                  <dd>{project.category}</dd>
                </div>
              )}
              {project.status && (
                <div>
                  <dt>{t.project.statusLabel}</dt>
                  <dd>{t.project.status[project.status] ?? project.status}</dd>
                </div>
              )}
              {project.technologies?.length > 0 && (
                <div>
                  <dt>{t.project.technologies}</dt>
                  <dd>
                    <ul className="tags">
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            {(prevProject || nextProject) && (
              <nav className="project-nav" aria-label={t.project.nav.label}>
                {prevProject ? (
                  <Link to={`/projects/${prevProject.slug}`} className="project-nav-link">
                    <span className="muted">{t.project.nav.previous}</span>
                    <span>
                      {language === 'ar'
                        ? prevProject.titleAr || prevProject.title
                        : prevProject.title || prevProject.titleAr}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextProject ? (
                  <Link
                    to={`/projects/${nextProject.slug}`}
                    className="project-nav-link project-nav-next"
                  >
                    <span className="muted">{t.project.nav.next}</span>
                    <span>
                      {language === 'ar'
                        ? nextProject.titleAr || nextProject.title
                        : nextProject.title || nextProject.titleAr}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}

            <section className="project-cta">
              <h2>{t.project.cta.title}</h2>
              <p>{t.project.cta.text}</p>
              <Link to="/#contact" className="btn btn-primary">
                {t.project.cta.action}
              </Link>
            </section>
          </article>
        )}
      </main>

      {status === 'ready' && currentScreenshot && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <img
            src={currentScreenshot}
            alt={`${title} ${lightbox + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label={t.project.close}
          >
            ×
          </button>
          {screenshots.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-prev"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightbox((lightbox + screenshots.length - 1) % screenshots.length)
                }}
                aria-label={t.project.nav.previous}
              />
              <button
                type="button"
                className="lightbox-next"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightbox((lightbox + 1) % screenshots.length)
                }}
                aria-label={t.project.nav.next}
              />
            </>
          )}
        </div>
      )}

      <Footer />
    </>
  )
}

export default ProjectPage
