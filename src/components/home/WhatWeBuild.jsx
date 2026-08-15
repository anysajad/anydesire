import { useLanguage } from '../../i18n/useLanguage.js'

function WhatWeBuild() {
  const { t } = useLanguage()

  return (
    <section id="build" className="section">
      <div className="container">
        <h2 className="section-heading">{t.build.heading}</h2>
        <div className="build-grid">
          {t.build.items.map((item) => (
            <div key={item.title} className="build-item">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhatWeBuild
