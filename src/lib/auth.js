import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase.js'

export const OWNER_UID = import.meta.env.VITE_ADMIN_UID

export async function signInWithEmail(email, password, persistent = true) {
  const persistence = persistent ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)
  return signInWithEmailAndPassword(auth, email, password)
}

export function signOutUser() {
  return signOut(auth)
}

export function getCurrentUser() {
  return auth.currentUser
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export function isOwner(user) {
  return Boolean(user && user.uid === OWNER_UID)
}

// Returns 'owner', 'developer', or null. A user is a developer when their UID
// has a document in the `admins` allow-list collection. The owner is always
// allowed regardless of the allow-list.
export async function getUserRole(user) {
  if (!user) return null
  if (isOwner(user)) return 'owner'
  try {
    const snapshot = await getDoc(doc(db, 'admins', user.uid))
    return snapshot.exists() ? 'developer' : null
  } catch {
    return null
  }
}

// Resolves the authoritative admin name from Firestore /admins/{uid}.name.
// Returns the name string if present, null if missing. Never falls back to email.
export async function getAdminName(uid) {
  if (!uid) return null
  try {
    const snap = await getDoc(doc(db, 'admins', uid))
    if (!snap.exists()) return null
    const data = snap.data()
    return data.name || null
  } catch {
    return null
  }
}
