import { useEffect } from 'react'

function setMeta(selector, attributeName, attributeValue, content) {
  const existing = document.head.querySelector(selector)
  if (!content) {
    if (existing) existing.remove()
    return
  }
  if (existing) {
    existing.setAttribute('content', content)
  } else {
    const meta = document.createElement('meta')
    meta.setAttribute(attributeName, attributeValue)
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
  }
}

export function usePageMeta(title, description, image) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:image"]', 'property', 'og:image', image)
  }, [title, description, image])
}
