import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

const DEVELOPERS_COLLECTION = 'admins'

export async function listDevelopers() {
  const q = query(collection(db, DEVELOPERS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((document) => ({ uid: document.id, ...document.data() }))
}

export function addDeveloper({ uid, email, name }) {
  return setDoc(doc(db, DEVELOPERS_COLLECTION, uid), {
    uid,
    email,
    name: name || '',
    createdAt: serverTimestamp(),
  })
}

export function removeDeveloper(uid) {
  return deleteDoc(doc(db, DEVELOPERS_COLLECTION, uid))
}
