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

const PROJECTS_COLLECTION = 'projects'

export const PROJECT_STATUSES = [
  'idea',
  'in-progress',
  'completed',
  'maintained',
  'archived',
]

export async function listProjects() {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export function newProjectId() {
  return doc(collection(db, PROJECTS_COLLECTION)).id
}

export function createProject(id, data) {
  return setDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateProject(id, data) {
  return updateDoc(doc(db, PROJECTS_COLLECTION, id), {
    ...data,
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
