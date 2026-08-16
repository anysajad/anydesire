import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

const CONTACT_DOC = 'settings/contact'

const fallbackContact = {
  instagram: 'https://www.instagram.com/anydesire.dev/',
  telegram: '',
  whatsapp: '',
  github: 'https://github.com/anysajad',
}

const emptyContact = {
  instagram: '',
  telegram: '',
  whatsapp: '',
  github: '',
}

function normalizeUrl(value, base) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${base.replace(/\/$/, '')}/${trimmed.replace(/^@/, '')}`
}

export function normalizeContact(data) {
  return {
    instagram: normalizeUrl(data.instagram, 'https://www.instagram.com'),
    telegram: normalizeUrl(data.telegram, 'https://t.me'),
    whatsapp: normalizeWhatsApp(data.whatsapp),
    github: normalizeUrl(data.github, 'https://github.com'),
  }
}

function normalizeWhatsApp(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const digits = trimmed.replace(/[^\d+]/g, '')
  return digits ? `https://wa.me/${digits.replace(/^\+/, '')}` : ''
}

export async function getContactSettings() {
  const snapshot = await getDoc(doc(db, CONTACT_DOC))
  if (!snapshot.exists()) return { ...fallbackContact }
  return {
    instagram: snapshot.data().instagram || '',
    telegram: snapshot.data().telegram || '',
    whatsapp: snapshot.data().whatsapp || '',
    github: snapshot.data().github || '',
  }
}

export function updateContactSettings(data) {
  return setDoc(doc(db, CONTACT_DOC), normalizeContact(data))
}

let settingsPromise = null

export function useContactSettings() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!settingsPromise) {
      settingsPromise = getContactSettings().catch((error) => {
        settingsPromise = null
        throw error
      })
    }
    settingsPromise
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {
        if (!cancelled) setSettings(emptyContact)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
