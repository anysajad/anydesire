import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase.js'

function uniqueFileName(file) {
  const extension = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.'))
    : ''
  const base = extension ? file.name.slice(0, -extension.length) : file.name
  const stamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `${base}-${stamp}-${random}${extension}`
}

async function uploadProjectImage(path, file) {
  const imageRef = ref(storage, path)
  await uploadBytes(imageRef, file)
  const url = await getDownloadURL(imageRef)
  return { url, path }
}

export function uploadProjectCover(projectId, file) {
  return uploadProjectImage(`projects/${projectId}/cover/${uniqueFileName(file)}`, file)
}

export function uploadProjectScreenshot(projectId, file) {
  return uploadProjectImage(
    `projects/${projectId}/screenshots/${uniqueFileName(file)}`,
    file,
  )
}

export function deleteProjectImage(path) {
  if (!path) return Promise.resolve()
  return deleteObject(ref(storage, path))
}
