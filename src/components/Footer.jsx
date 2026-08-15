import { useLanguage } from '../i18n/useLanguage.js'
import { socials } from '../lib/socials.js'

function Footer() {
  const { t, language, setLanguage } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand">AnyDesire</div>
          <p className="muted">{t.footer.tagline}</p>
        </div>
        <div className="footer-links">
          <a href={socials.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {socials.instagram && (
            <a href={socials.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            aria-label="Switch language"
          >
            {t.nav.language}
          </button>
        </div>
      </div>
      <div className="container footer-bottom">
        © {year} AnyDesire. {t.footer.rights}
      </div>
    </footer>
  )
}

export default Footer
