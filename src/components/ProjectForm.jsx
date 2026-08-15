import { useState } from 'react'
import { PROJECT_STATUSES } from '../lib/projects.js'

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
  coverImage: '',
  screenshots: '',
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

const urlFields = ['coverImage', 'githubUrl', 'demoUrl']

function toArray(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
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

function ProjectForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...defaults,
    ...initialData,
    technologies: initialData?.technologies?.join(', ') ?? '',
    features: initialData?.features?.join(', ') ?? '',
    screenshots: initialData?.screenshots?.join(', ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
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
      coverImage: form.coverImage.trim(),
      screenshots: toArray(form.screenshots),
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
    try {
      await onSubmit(data)
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
        <Field label="Cover image URL">
          <input
            type="text"
            value={form.coverImage}
            onChange={(event) => setField('coverImage', event.target.value)}
          />
        </Field>
        <Field label="Screenshots (comma-separated URLs)">
          <input
            type="text"
            value={form.screenshots}
            onChange={(event) => setField('screenshots', event.target.value)}
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
