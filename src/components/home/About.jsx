import { useLanguage } from '../../i18n/useLanguage.js'

function About() {
  const { t } = useLanguage()

  return (
    <section id="about" className="section">
      <div className="container split">
        <h2 className="section-heading">{t.about.heading}</h2>
        <p className="about-text">{t.about.text}</p>
      </div>
    </section>
  )
}

export default About
