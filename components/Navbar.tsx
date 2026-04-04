'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link href="/" className="app-brand">Career Hub</Link>

        <nav className="app-nav-links">
          <Link href="/">Profiles</Link>
          <Link href="/resume">Resume</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/scheduler">Scheduler</Link>
        </nav>

        <div className="app-nav-actions">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="nav-btn nav-btn-primary">Sign In</Link>
              <Link href="/register" className="nav-btn nav-btn-ghost">Register</Link>
            </>
          ) : (
            <>
              <Link href="/settings" className="nav-btn nav-btn-ghost">Settings</Link>
              <Link href="/analytics" className="nav-btn nav-btn-ghost">Analytics</Link>
              <Link href="/edit" className="nav-btn nav-btn-ghost">Edit Profile</Link>
              <button type="button" className="nav-btn nav-btn-primary" onClick={handleLogout}>
                {user?.firstName ?? 'Account'} Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
