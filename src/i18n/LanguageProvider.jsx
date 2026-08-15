import { useEffect, useState } from 'react'
import { translations } from './translations.js'
import { LanguageContext } from './useLanguage.js'

const STORAGE_KEY = 'anydesire-lang'

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' || saved === 'ar' ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.title = translations[language].meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translations[language].meta.description)
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}
