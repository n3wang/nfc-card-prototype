import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="page-container">
      <div className="card">
        <h1>Settings</h1>
        <p>Account and profile preferences will live here.</p>
        <p style={{ marginBottom: 0, opacity: 0.8 }}>
          For now, you can update profile details from the edit screen.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/edit" className="link-button" style={{ display: 'inline-block', margin: 0 }}>
            Go to Edit Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
