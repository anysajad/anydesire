import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useLanguage } from '../i18n/useLanguage.js'

function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <>
      <Navbar />
      <main className="container notfound">
        <h1>{t.notFound.title}</h1>
        <p className="muted">{t.notFound.text}</p>
        <Link to="/" className="btn">
          {t.notFound.home}
        </Link>
      </main>
      <Footer />
    </>
  )
}

export default NotFoundPage
