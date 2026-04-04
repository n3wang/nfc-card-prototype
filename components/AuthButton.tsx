'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function AuthButton() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="auth-button">
        Sign In
      </Link>
    )
  }

  return (
    <div className="auth-button-group">
      <Link href="/edit" className="auth-button auth-button-edit">
        ✏️ Edit Profile
      </Link>
      <button className="auth-button auth-button-logout" onClick={handleLogout}>
        {user?.firstName ?? 'Account'} · Sign Out
      </button>
    </div>
  )
}
