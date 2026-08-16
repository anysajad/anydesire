import { useLanguage } from '../i18n/useLanguage.js'
import { useContactSettings } from '../lib/settings.js'

const footerItems = ['github', 'instagram', 'telegram', 'whatsapp']

function Footer() {
  const { t, language, setLanguage } = useLanguage()
  const settings = useContactSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand">AnyDesire</div>
          <p className="muted">{t.footer.tagline}</p>
        </div>
        <div className="footer-links">
          {settings &&
            footerItems.map((item) =>
              settings[item] ? (
                <a key={item} href={settings[item]} target="_blank" rel="noreferrer">
                  {t.contact[item]}
                </a>
              ) : null,
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
