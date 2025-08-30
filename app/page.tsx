import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container">
      <div className="profile-section">
        <div className="avatar">
          JD
        </div>
        <h1 className="profile-name">John Doe</h1>
        <p className="profile-bio">
          Full Stack Developer | Designer | Entrepreneur
          <br />
          Building digital experiences that matter
        </p>
      </div>

      <div className="links-container">
        <Link href="/resume" className="link-button">
          📄 My Resume
        </Link>
        
        <Link href="/portfolio" className="link-button">
          💼 Portfolio
        </Link>
        
        <Link href="/scheduler" className="link-button">
          📅 Schedule a Meeting
        </Link>
        
        <a href="https://linkedin.com/in/johndoe" className="link-button" target="_blank" rel="noopener noreferrer">
          💼 LinkedIn
        </a>
        
        <a href="https://github.com/johndoe" className="link-button" target="_blank" rel="noopener noreferrer">
          🐱 GitHub
        </a>
        
        <a href="https://twitter.com/johndoe" className="link-button" target="_blank" rel="noopener noreferrer">
          🐦 Twitter
        </a>
        
        <a href="mailto:john@example.com" className="link-button">
          ✉️ Email Me
        </a>
      </div>
    </div>
  )
}