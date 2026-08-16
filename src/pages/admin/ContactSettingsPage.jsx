import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getContactSettings,
  updateContactSettings,
} from '../../lib/settings.js'

const empty = { instagram: '', telegram: '', whatsapp: '', github: '' }

function ContactSettingsPage() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getContactSettings()
      .then((data) => {
        if (!cancelled) {
          setForm({
            instagram: data.instagram || '',
            telegram: data.telegram || '',
            whatsapp: data.whatsapp || '',
            github: data.github || '',
          })
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load contact settings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    setError('')
    try {
      await updateContactSettings(form)
      setNotice('Contact information saved.')
      setTimeout(() => setNotice(''), 3000)
    } catch {
      setError('Failed to save contact settings.')
    } finally {
      setSaving(false)
    }
  }

  const fieldProps = (field, label, placeholder, hint) => ({
    field,
    label,
    placeholder,
    hint,
  })

  const fields = [
    fieldProps('github', 'GitHub', 'https://github.com/anydesire', 'Username or full URL'),
    fieldProps('instagram', 'Instagram', 'https://www.instagram.com/anydesire.dev', 'Username or full URL'),
    fieldProps('telegram', 'Telegram', 'anydesire', 'Username or full URL'),
    fieldProps('whatsapp', 'WhatsApp', '9647XXXXXXXXX', 'Phone number or full URL'),
  ]

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Contact Information</h1>
          <p className="admin-subtitle">
            <Link to="/admin" className="admin-back">
              ← Back to projects
            </Link>
          </p>
        </div>
      </header>

      {loading && <p className="muted">Loading contact settings...</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && (
        <form className="project-form" onSubmit={handleSubmit}>
          <fieldset className="form-group">
            <legend>Social links</legend>
            {fields.map(({ field, label, placeholder, hint }) => (
              <label key={field} className="field">
                <span>{label}</span>
                <input
                  type="text"
                  value={form[field]}
                  onChange={(event) => setField(field, event.target.value)}
                  placeholder={placeholder}
                />
                <span className="field-hint">{hint}</span>
              </label>
            ))}
          </fieldset>
          <p className="field-hint">
            Leave a field empty to hide that link from the public website.
          </p>
          {notice && <p className="notice">{notice}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <Link to="/admin" className="btn-admin-link">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default ContactSettingsPage
