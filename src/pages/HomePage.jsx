import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/home/Hero.jsx'
import SelectedWork from '../components/home/SelectedWork.jsx'
import About from '../components/home/About.jsx'
import WhatWeBuild from '../components/home/WhatWeBuild.jsx'
import Contact from '../components/home/Contact.jsx'
import { useLanguage } from '../i18n/useLanguage.js'
import { usePageMeta } from '../i18n/usePageMeta.js'

function HomePage() {
  const location = useLocation()
  const { t } = useLanguage()
  usePageMeta(t.meta.title, t.meta.description)

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) target.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SelectedWork />
        <About />
        <WhatWeBuild />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default HomePage
