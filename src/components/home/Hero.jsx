import { useLanguage } from '../../i18n/useLanguage.js'

function Hero() {
  const { t } = useLanguage()

  return (
    <section className="hero container">
      <h1 className="hero-title">{t.hero.title}</h1>
      <p className="hero-subtitle">{t.hero.subtitle}</p>
      <div className="hero-actions">
        <a href="/#work" className="btn btn-primary">
          {t.hero.primary}
        </a>
        <a href="/#contact" className="btn">
          {t.hero.secondary}
        </a>
      </div>
    </section>
  )
}

export default Hero
