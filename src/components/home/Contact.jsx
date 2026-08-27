import { useLanguage } from '../../i18n/useLanguage.js'
import { useContactSettings } from '../../lib/settings.js'

const contactItems = ['github', 'instagram', 'telegram', 'whatsapp']

function Contact() {
  const { t } = useLanguage()
  const settings = useContactSettings()

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>{t.contact.heading}</h2>
        <p className="contact-text">{t.contact.text}</p>
        <div className="contact-links">
          {settings &&
            contactItems.map((item) =>
              settings[item] ? (
                <a
                  key={item}
                  href={settings[item]}
                  className="btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.contact[item]}
                </a>
              ) : null,
            )}
        </div>
      </div>
    </section>
  )
}

export default Contact
