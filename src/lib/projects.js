import {
  collection,
  deleteDoc,
  doc,
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

// Determines the next order value by reading all projects and finding the
// highest valid numeric order. Handles missing, null, and non-numeric orders
// safely by ignoring them.
// NOTE: This is not atomic — two simultaneous creates could theoretically
// get the same order. Acceptable for this small portfolio.
export async function getNextOrder() {
  const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION))
  const validOrders = snapshot.docs
    .map((doc) => doc.data().order)
    .filter((o) => Number.isFinite(o))
  if (validOrders.length === 0) return 1
  return Math.max(...validOrders) + 1
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
  const [name, nextOrder] = await Promise.all([
    getAdminName(user.uid),
    getNextOrder(),
  ])
  const { order: _order, ...rest } = data
  return setDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...rest,
    order: nextOrder,
    createdByUid: user.uid,
    createdByName: name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateProject(id, data) {
  const {
    createdByUid: _cUid,
    createdByName: _cName,
    createdAt: _cAt,
    slug: _slug,
    ...rest
  } = data
  return updateDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...rest,
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
