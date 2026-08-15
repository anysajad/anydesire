import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase.js'

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID

export function signInWithEmail(email, password) {
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

export function isAdmin(user) {
  return Boolean(user && user.uid === ADMIN_UID)
}
