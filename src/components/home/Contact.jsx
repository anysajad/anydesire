import { useLanguage } from '../../i18n/useLanguage.js'
import { socials } from '../../lib/socials.js'

function Contact() {
  const { t } = useLanguage()

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>{t.contact.heading}</h2>
        <p className="contact-text">{t.contact.text}</p>
        <div className="contact-links">
          <a href={socials.github} className="btn" target="_blank" rel="noreferrer">
            {t.contact.github}
          </a>
          {socials.instagram && (
            <a href={socials.instagram} className="btn" target="_blank" rel="noreferrer">
              {t.contact.instagram}
            </a>
          )}
          <a href="/#work" className="btn btn-primary">
            {t.contact.action}
          </a>
        </div>
      </div>
    </section>
  )
}

export default Contact
