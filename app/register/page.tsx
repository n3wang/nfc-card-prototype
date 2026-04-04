'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/edit')
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      router.push('/edit')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦</div>
          <h1>Create account</h1>
          <p>Set up your personal hub</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input id="firstName" type="text" value={form.firstName}
                onChange={set('firstName')} placeholder="John" required />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input id="lastName" type="text" value={form.lastName}
                onChange={set('lastName')} placeholder="Doe" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={form.username}
              onChange={set('username')} placeholder="johndoe"
              pattern="[a-zA-Z0-9_-]+" title="Letters, numbers, _ and - only"
              required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email}
              onChange={set('email')} placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password}
              onChange={set('password')} placeholder="Min 8 characters"
              minLength={8} required />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
        <p className="auth-footer">
          <Link href="/" className="auth-link">← Back to profile</Link>
        </p>
      </div>
    </div>
  )
}
