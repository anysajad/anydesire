import { useLanguage } from '../i18n/useLanguage.js'

function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-bottom">
        © {year} AnyDesire. {t.footer.rights}
      </div>
    </footer>
  )
}

export default Footer
