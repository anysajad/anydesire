import { useEffect, useRef, useState } from 'react'
import { PROJECT_STATUSES } from '../lib/projects.js'
import { uploadProjectCover, uploadProjectScreenshot } from '../lib/storage.js'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

const defaults = {
  title: '',
  titleAr: '',
  slug: '',
  shortDescription: '',
  shortDescriptionAr: '',
  description: '',
  descriptionAr: '',
  status: 'idea',
  category: '',
  technologies: '',
  features: '',
  githubUrl: '',
  demoUrl: '',
  featured: false,
  published: false,
  order: '',
}

const requiredFields = {
  title: 'Title',
  titleAr: 'Arabic title',
  slug: 'Slug',
  shortDescription: 'Short description',
  shortDescriptionAr: 'Arabic short description',
  status: 'Status',
  category: 'Category',
}

const urlFields = ['githubUrl', 'demoUrl']

function toArray(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function normalizeImage(value) {
  if (!value) return null
  if (typeof value === 'string') return { url: value, path: '' }
  return value
}

function validateImageFile(file) {
  if (!file.type.startsWith('image/')) return 'Only image files are allowed.'
  if (file.size > MAX_IMAGE_SIZE) return 'Image must be 10 MB or smaller.'
  return ''
}

function validate(data) {
  const errors = {}
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!data[field]) {
      errors[field] = `${label} is required.`
    }
  }
  if (!Number.isFinite(data.order)) {
    errors.order = 'Order must be a number.'
  }
  for (const field of urlFields) {
    if (data[field]) {
      try {
        new URL(data[field])
      } catch {
        errors[field] = 'Must be a valid URL.'
      }
    }
  }
  return errors
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function ProjectForm({ projectId, initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...defaults,
    ...initialData,
    technologies: initialData?.technologies?.join(', ') ?? '',
    features: initialData?.features?.join(', ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [imageError, setImageError] = useState('')

  const existingCover = normalizeImage(initialData?.coverImage)
  const initialScreenshots = (initialData?.screenshots ?? []).map(normalizeImage)

  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [newScreenshotFiles, setNewScreenshotFiles] = useState([])
  const [removedScreenshotPaths, setRemovedScreenshotPaths] = useState([])

  const previewsRef = useRef([])
  const trackPreview = (url) => {
    previewsRef.current.push(url)
    return url
  }
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const keptScreenshots = initialScreenshots.filter(
    (screenshot) => !removedScreenshotPaths.includes(screenshot.path),
  )

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCoverFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const fileError = validateImageFile(file)
    if (fileError) {
      setImageError(fileError)
      event.target.value = ''
      return
    }
    setImageError('')
    setCoverFile(file)
    setCoverPreview(trackPreview(URL.createObjectURL(file)))
    setCoverRemoved(false)
  }

  function handleScreenshots(event) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const fileError = files.map(validateImageFile).find(Boolean)
    if (fileError) {
      setImageError(fileError)
      event.target.value = ''
      return
    }
    setImageError('')
    setNewScreenshotFiles((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: trackPreview(URL.createObjectURL(file)) })),
    ])
    event.target.value = ''
  }

  function removeNewScreenshot(item) {
    URL.revokeObjectURL(item.previewUrl)
    setNewScreenshotFiles((prev) => prev.filter((screenshot) => screenshot !== item))
  }

  function cancelNewCover() {
    URL.revokeObjectURL(coverPreview)
    setCoverPreview('')
    setCoverFile(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const data = {
      title: form.title.trim(),
      titleAr: form.titleAr.trim(),
      slug: form.slug.trim(),
      shortDescription: form.shortDescription.trim(),
      shortDescriptionAr: form.shortDescriptionAr.trim(),
      description: form.description.trim(),
      descriptionAr: form.descriptionAr.trim(),
      status: form.status,
      category: form.category.trim(),
      technologies: toArray(form.technologies),
      features: toArray(form.features),
      githubUrl: form.githubUrl.trim(),
      demoUrl: form.demoUrl.trim(),
      featured: form.featured,
      published: form.published,
      order: form.order === '' ? NaN : Number(form.order),
    }
    const nextErrors = validate(data)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setImageError('')
    try {
      let coverImage = null
      if (coverRemoved) {
        coverImage = null
      } else if (coverFile) {
        coverImage = await uploadProjectCover(projectId, coverFile)
      } else {
        coverImage = existingCover
      }

      const uploadedScreenshots = []
      for (const item of newScreenshotFiles) {
        uploadedScreenshots.push(await uploadProjectScreenshot(projectId, item.file))
      }
      const screenshots = [...keptScreenshots, ...uploadedScreenshots]

      await onSubmit({ ...data, coverImage, screenshots })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field label="Title" error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
          />
        </Field>
        <Field label="Arabic title" error={errors.titleAr}>
          <input
            type="text"
            value={form.titleAr}
            onChange={(event) => setField('titleAr', event.target.value)}
          />
        </Field>
        <Field label="Slug" error={errors.slug}>
          <input
            type="text"
            value={form.slug}
            onChange={(event) => setField('slug', event.target.value)}
          />
        </Field>
        <Field label="Status" error={errors.status}>
          <select
            value={form.status}
            onChange={(event) => setField('status', event.target.value)}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" error={errors.category}>
          <input
            type="text"
            value={form.category}
            onChange={(event) => setField('category', event.target.value)}
          />
        </Field>
        <Field label="Order" error={errors.order}>
          <input
            type="number"
            value={form.order}
            onChange={(event) => setField('order', event.target.value)}
          />
        </Field>
        <Field label="Technologies (comma-separated)">
          <input
            type="text"
            value={form.technologies}
            onChange={(event) => setField('technologies', event.target.value)}
          />
        </Field>
        <Field label="Features (comma-separated)">
          <input
            type="text"
            value={form.features}
            onChange={(event) => setField('features', event.target.value)}
          />
        </Field>
        <Field label="GitHub URL">
          <input
            type="text"
            value={form.githubUrl}
            onChange={(event) => setField('githubUrl', event.target.value)}
          />
        </Field>
        <Field label="Demo URL">
          <input
            type="text"
            value={form.demoUrl}
            onChange={(event) => setField('demoUrl', event.target.value)}
          />
        </Field>
      </div>

      <Field label="Short description (EN)" error={errors.shortDescription}>
        <textarea
          rows="2"
          value={form.shortDescription}
          onChange={(event) => setField('shortDescription', event.target.value)}
        />
      </Field>
      <Field label="Short description (AR)" error={errors.shortDescriptionAr}>
        <textarea
          rows="2"
          value={form.shortDescriptionAr}
          onChange={(event) => setField('shortDescriptionAr', event.target.value)}
        />
      </Field>
      <Field label="Description (EN)">
        <textarea
          rows="4"
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
        />
      </Field>
      <Field label="Description (AR)">
        <textarea
          rows="4"
          value={form.descriptionAr}
          onChange={(event) => setField('descriptionAr', event.target.value)}
        />
      </Field>

      <div className="image-upload">
        <span className="image-label">Cover image</span>
        {!coverRemoved && (coverPreview || existingCover) && (
          <div className="image-preview">
            <img src={coverPreview || existingCover.url} alt="Cover preview" />
          </div>
        )}
        {coverRemoved && <p className="muted">Cover image will be removed.</p>}
        <input type="file" accept="image/*" onChange={handleCoverFile} />
        {coverFile && (
          <button type="button" onClick={cancelNewCover} disabled={saving}>
            Cancel new cover
          </button>
        )}
        {!coverFile && existingCover && !coverRemoved && (
          <button type="button" onClick={() => setCoverRemoved(true)} disabled={saving}>
            Remove cover
          </button>
        )}
      </div>

      <div className="image-upload">
        <span className="image-label">Screenshots</span>
        {keptScreenshots.length > 0 && (
          <div className="thumb-grid">
            {keptScreenshots.map((screenshot) => (
              <div key={screenshot.path} className="thumb">
                <img src={screenshot.url} alt="Screenshot" />
                <button
                  type="button"
                  onClick={() =>
                    setRemovedScreenshotPaths((prev) => [...prev, screenshot.path])
                  }
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {newScreenshotFiles.length > 0 && (
          <div className="thumb-grid">
            {newScreenshotFiles.map((item) => (
              <div key={item.file.name} className="thumb">
                <img src={item.previewUrl} alt={item.file.name} />
                <button type="button" onClick={() => removeNewScreenshot(item)} disabled={saving}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple onChange={handleScreenshots} />
      </div>

      {imageError && <p className="error">{imageError}</p>}

      <div className="form-checkboxes">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setField('featured', event.target.checked)}
          />
          Featured
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => setField('published', event.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProjectForm
