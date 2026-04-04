'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileDetail } from '../../lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SLUG = process.env.NEXT_PUBLIC_PROFILE_SLUG || 'john-doe'

interface ProfileForm {
  displayName: string
  title: string
  bio: string
  themePreference: string
  details: ProfileDetail[]
}

export default function EditPage() {
  const { isAuthenticated, token } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    title: '',
    bio: '',
    themePreference: 'default',
    details: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    fetch(`${API}/api/profiles/${SLUG}`)
      .then(r => r.json())
      .then(data => {
        const p = data.profile
        setForm({
          displayName: p.displayName ?? '',
          title: p.title ?? '',
          bio: p.bio ?? '',
          themePreference: p.themePreference ?? 'default',
          details: Array.isArray(p.details) ? p.details : [],
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/profiles/${SLUG}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to save profile')
      }
      setSuccess('Profile saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const updateDetail = (index: number, field: keyof ProfileDetail, value: string) => {
    setForm(f => {
      const details = [...f.details]
      details[index] = { ...details[index], [field]: field === 'link' && !value ? null : value }
      return { ...f, details }
    })
  }

  const addDetail = () => {
    setForm(f => ({ ...f, details: [...f.details, { header: '', value: '', link: null }] }))
  }

  const removeDetail = (index: number) => {
    setForm(f => ({ ...f, details: f.details.filter((_, i) => i !== index) }))
  }

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-loading">Loading profile…</div>
      </div>
    )
  }

  return (
    <div className="edit-page">
      <div className="edit-container">
        <div className="edit-header">
          <div>
            <h1>Edit Profile</h1>
            <p>Update your public profile information</p>
          </div>
          <Link href="/" className="back-button">← View Profile</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Basic Info</h2>

            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title / Role</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Software Engineer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell visitors about yourself…"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={form.themePreference}
                onChange={e => setForm(f => ({ ...f, themePreference: e.target.value }))}
              >
                <option value="default">Default (Gradient)</option>
                <option value="academia">Academia (Dark Professional)</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2>Profile Details</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              These appear as info rows on your profile (email, location, website, etc.)
            </p>

            <div className="details-editor">
              {form.details.map((detail, i) => (
                <div key={i} className="detail-row">
                  <input
                    type="text"
                    value={detail.header}
                    onChange={e => updateDetail(i, 'header', e.target.value)}
                    placeholder="Label (e.g. Email)"
                  />
                  <input
                    type="text"
                    value={detail.value}
                    onChange={e => updateDetail(i, 'value', e.target.value)}
                    placeholder="Value (e.g. john@example.com)"
                  />
                  <input
                    type="url"
                    value={detail.link ?? ''}
                    onChange={e => updateDetail(i, 'link', e.target.value)}
                    placeholder="Link (optional)"
                  />
                  <button
                    type="button"
                    className="detail-remove-btn"
                    onClick={() => removeDetail(i)}
                    aria-label="Remove row"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="detail-add-btn" onClick={addDetail}>
              + Add Detail Row
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="edit-success">{success}</p>}

          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
