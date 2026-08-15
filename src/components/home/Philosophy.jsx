import { useLanguage } from '../../i18n/useLanguage.js'

function Philosophy() {
  const { t } = useLanguage()

  return (
    <section id="philosophy" className="philosophy">
      <div className="container">
        <span className="visually-hidden">{t.philosophy.heading}</span>
        <p className="philosophy-statement">{t.philosophy.statement}</p>
        <p className="philosophy-text">{t.philosophy.text}</p>
      </div>
    </section>
  )
}

export default Philosophy
