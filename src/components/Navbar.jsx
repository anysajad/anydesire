import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage.js'

function Navbar() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Main">
        <Link to="/" className="brand">
          <img src="/icon-only.svg" className="brand-icon" alt="" aria-hidden="true" />
          AnyDesire
        </Link>
        <div className="nav-links">
          <Link to="/#work">{t.nav.work}</Link>
          <Link to="/#about">{t.nav.about}</Link>
          <Link to="/#contact">{t.nav.contact}</Link>
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            aria-label="Switch language"
          >
            {t.nav.language}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
