import { useState } from 'react'
import { PROJECT_STATUSES, generateSlug } from '../lib/projects.js'

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
  screenshots: [],
  githubUrl: '',
  demoUrl: '',
  featured: false,
  published: false,
  order: '',
}

const requiredFields = {
  title: 'Title',
  titleAr: 'Arabic title',
  shortDescription: 'Short description',
  shortDescriptionAr: 'Arabic short description',
  status: 'Status',
  category: 'Category',
}

const urlFields = ['coverImage', 'githubUrl', 'demoUrl']

function toArray(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
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
    if (data[field] && !isValidUrl(data[field])) {
      errors[field] = 'Must be a valid URL.'
    }
  }
  if (data.screenshots.some((url) => !isValidUrl(url))) {
    errors.screenshots = 'Each screenshot must be a valid URL.'
  }
  return errors
}

function Required() {
  return <span className="required-mark" aria-label="required">*</span>
}

function Field({ label, required, error, dir, children }) {
  return (
    <label className={`field${dir === 'rtl' ? ' rtl' : ''}`}>
      <span>
        {label}
        {required && <Required />}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function FormSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="form-section">
      <button
        type="button"
        className="form-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <span className="chevron">&#9660;</span>
      </button>
      <div className={`form-section-body${open ? '' : ' is-collapsed'}`}>
        {children}
      </div>
    </div>
  )
}

function ImagePreview({ url }) {
  const [visible, setVisible] = useState(true)
  if (!url) return null
  return (
    <img
      className="thumb"
      src={url}
      alt="Preview"
      onError={() => setVisible(false)}
      style={visible ? {} : { display: 'none' }}
    />
  )
}

function formatDate(date) {
  if (!date) return null
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ProjectForm({ initialData, onSubmit, onCancel }) {
  const isEdit = Boolean(initialData?.id)

  const [form, setForm] = useState(() => {
    const slug = isEdit ? (initialData.slug || '') : generateSlug(initialData?.title || '')
    return {
      ...defaults,
      ...initialData,
      slug,
      technologies: initialData?.technologies?.join(', ') ?? '',
      features: initialData?.features?.join(', ') ?? '',
      screenshots: initialData?.screenshots ?? [],
    }
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setScreenshot(index, value) {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.map((url, i) => (i === index ? value : url)),
    }))
  }

  function addScreenshot() {
    setForm((prev) => ({ ...prev, screenshots: [...prev.screenshots, ''] }))
  }

  function removeScreenshot(index) {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }))
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
      screenshots: form.screenshots.map((url) => url.trim()).filter(Boolean),
      githubUrl: form.githubUrl.trim(),
      demoUrl: form.demoUrl.trim(),
      featured: form.featured,
      published: form.published,
      order: isEdit ? (form.order === '' ? NaN : Number(form.order)) : 0,
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

  const createdDate = formatDate(initialData?.createdAt)
  const updatedDate = formatDate(initialData?.updatedAt)

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-sticky-header">
        <span className="form-sticky-title">
          {isEdit ? 'Edit Project' : 'New Project'}
        </span>
        <span className={`form-sticky-status${form.published ? ' is-published' : ''}`}>
          {form.published ? 'Published' : 'Draft'}
        </span>
        <div className="form-sticky-actions">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      {isEdit && (
        <div className="project-meta">
          <span>Created by {initialData.createdByName ?? 'Null'}{createdDate ? ` · ${createdDate}` : ''}</span>
          {updatedDate && (
            <span>Last updated · {updatedDate}</span>
          )}
        </div>
      )}

      <FormSection title="Essential Information">
        <div className="form-grid">
          <Field label="Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Debt Ledger"
            />
          </Field>
          <Field label="Arabic title" required dir="rtl" error={errors.titleAr}>
            <input
              type="text"
              value={form.titleAr}
              onChange={(event) => setField('titleAr', event.target.value)}
              placeholder="دفتر الديون"
            />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Category" required dir="rtl" error={errors.category}>
            <input
              type="text"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
              placeholder="Web Application"
            />
          </Field>
          <Field label="Status" required error={errors.status}>
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
        </div>
      </FormSection>

      <FormSection title="Descriptions">
        <Field label="Short description" required error={errors.shortDescription}>
          <textarea
            rows="2"
            value={form.shortDescription}
            onChange={(event) => setField('shortDescription', event.target.value)}
            placeholder="Simple debt management for small businesses."
          />
        </Field>
        <Field label="Full description">
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="Describe what the project does, why it was built, and what problem it solves..."
          />
        </Field>
        <Field label="Arabic short description" required dir="rtl" error={errors.shortDescriptionAr}>
          <textarea
            rows="2"
            value={form.shortDescriptionAr}
            onChange={(event) => setField('shortDescriptionAr', event.target.value)}
            placeholder="برنامج بسيط لإدارة ديون الزبائن لأصحاب المحلات."
          />
        </Field>
        <Field label="Arabic full description" dir="rtl">
          <textarea
            rows="4"
            value={form.descriptionAr}
            onChange={(event) => setField('descriptionAr', event.target.value)}
            placeholder="اكتب وصفاً للمشروع وما المشكلة التي يحلها..."
          />
        </Field>
      </FormSection>

      <FormSection title="Technologies" defaultOpen={false}>
        <Field label="Technologies (comma-separated)">
          <input
            type="text"
            value={form.technologies}
            onChange={(event) => setField('technologies', event.target.value)}
            placeholder="React, Vite, Firebase"
          />
        </Field>
      </FormSection>

      <FormSection title="Features" defaultOpen={false}>
        <Field label="Features (comma-separated)" dir="rtl">
          <input
            type="text"
            value={form.features}
            onChange={(event) => setField('features', event.target.value)}
            placeholder="Customer management, Debt tracking, Payment history"
          />
        </Field>
      </FormSection>

      <FormSection title="Media" defaultOpen={false}>
        <div className="image-upload">
          <span className="image-label">Cover image</span>
          {errors.coverImage && <span className="field-error">{errors.coverImage}</span>}
          <ImagePreview url={form.coverImage.trim()} />
          <input
            type="text"
            value={form.coverImage}
            onChange={(event) => setField('coverImage', event.target.value)}
            placeholder="https://example.com/project-cover.jpg"
          />
        </div>
        <div className="image-upload">
          <span className="image-label">Screenshots</span>
          {errors.screenshots && <span className="field-error">{errors.screenshots}</span>}
          {form.screenshots.map((url, index) => (
            <div key={index} className="screenshot-row">
              <ImagePreview url={url.trim()} />
              <input
                type="text"
                value={url}
                onChange={(event) => setScreenshot(index, event.target.value)}
                placeholder="https://example.com/screenshot-1.jpg"
              />
              <button type="button" onClick={() => removeScreenshot(index)} disabled={saving}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addScreenshot} disabled={saving}>
            Add screenshot URL
          </button>
        </div>
      </FormSection>

      <FormSection title="Links" defaultOpen={false}>
        <div className="form-grid">
          <Field label="GitHub URL" error={errors.githubUrl}>
            <input
              type="text"
              value={form.githubUrl}
              onChange={(event) => setField('githubUrl', event.target.value)}
              placeholder="https://github.com/anydesire/..."
            />
          </Field>
          <Field label="Demo URL" error={errors.demoUrl}>
            <input
              type="text"
              value={form.demoUrl}
              onChange={(event) => setField('demoUrl', event.target.value)}
              placeholder="https://example.com/..."
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Publishing / Display Settings">
        <div className="form-checkboxes">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setField('published', event.target.checked)}
            />
            Published
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setField('featured', event.target.checked)}
            />
            Featured
          </label>
        </div>
        {isEdit && (
          <Field label="Order" error={errors.order}>
            <input
              type="number"
              value={form.order}
              onChange={(event) => setField('order', event.target.value)}
              placeholder="1"
            />
          </Field>
        )}
        {isEdit && form.slug && (
          <Field label="Slug">
            <div className="slug-display">{form.slug}</div>
          </Field>
        )}
      </FormSection>
    </form>
  )
}

export default ProjectForm
