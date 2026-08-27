import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase.js'
import { getAdminName } from './auth.js'

const PROJECTS_COLLECTION = 'projects'

export const PROJECT_STATUSES = [
  'idea',
  'in-progress',
  'completed',
  'maintained',
  'archived',
]

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function randomSuffix() {
  const bytes = new Uint8Array(3)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateSlug(title) {
  const base = slugify(title) || 'project'
  return `${base}-${randomSuffix()}`
}

export async function isSlugUnique(slug) {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('slug', '==', slug),
    limit(1),
  )
  const snapshot = await getDocs(q)
  return snapshot.empty
}

export async function listProjects() {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export function newProjectId() {
  return doc(collection(db, PROJECTS_COLLECTION)).id
}

export async function createProject(id, data, user) {
  const name = await getAdminName(user.uid)
  return setDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...data,
    createdByUid: user.uid,
    createdByName: name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateProject(id, data, user) {
  const {
    createdByUid: _cUid,
    createdByName: _cName,
    createdAt: _cAt,
    slug: _slug,
    ...rest
  } = data

  // Detect unpublished → published transition
  let publisherFields = {}
  if (user) {
    const existingSnap = await getDoc(doc(db, PROJECTS_COLLECTION, id))
    const existing = existingSnap.exists() ? existingSnap.data() : {}
    const wasPublished = existing.published === true
    const isNowPublished = rest.published === true

    if (!wasPublished && isNowPublished) {
      const pubName = await getAdminName(user.uid)
      publisherFields = {
        publishedByUid: user.uid,
        publishedByName: pubName,
        publishedAt: serverTimestamp(),
      }
    }
  }

  return updateDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...rest,
    ...publisherFields,
    updatedAt: serverTimestamp(),
  })
}

export function deleteProject(id) {
  return deleteDoc(doc(db, PROJECTS_COLLECTION, id))
}

export async function listPublishedProjects() {
  const q = query(collection(db, PROJECTS_COLLECTION), where('published', '==', true))
  const snapshot = await getDocs(q)
  const projects = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
  return projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function getPublishedProjectBySlug(slug) {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('published', '==', true),
    where('slug', '==', slug),
    limit(1),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}
