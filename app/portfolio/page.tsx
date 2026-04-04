import Link from 'next/link'
import { getPortfolio, type ProfileItem } from '../../lib/api'

const PROFILE_SLUG = process.env.NEXT_PUBLIC_PROFILE_SLUG || 'john-doe'

type PortfolioPageProps = {
  searchParams?: Promise<{ slug?: string | string[] }>
}

function ProjectCard({ item }: { item: ProfileItem }) {
  const meta = item.metadata
  const technologies = Array.isArray(meta?.technologies) ? (meta.technologies as string[]) : []
  const liveUrl = meta?.live_url as string | undefined
  const githubUrl = meta?.github_url as string | undefined

  return (
    <div className="project-card">
      <div className="project-image">💼</div>
      <div className="project-content">
        <h3 className="project-title">{item.title}</h3>
        {item.subtitle && (
          <p style={{ color: '#667eea', fontWeight: 600, marginBottom: '0.5rem' }}>
            {item.subtitle}{item.year ? ` · ${item.year}` : ''}
          </p>
        )}
        {item.description && <p className="project-description">{item.description}</p>}

        {technologies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {technologies.map((tech, i) => (
              <span
                key={i}
                style={{ background: '#f0f0f0', padding: '0.25rem 0.5rem', borderRadius: 12, fontSize: '0.8rem', color: '#666' }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="project-links">
          {liveUrl && (
            <a href={liveUrl} className="project-link primary" target="_blank" rel="noopener noreferrer">
              Live Demo
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} className="project-link secondary" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const params = searchParams ? await searchParams : undefined
  const requestedSlug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug
  const slug = requestedSlug || PROFILE_SLUG
  const items = await getPortfolio(slug)

  return (
    <div className="page-container">
      <Link href="/" className="back-button">← Back to Home</Link>

      <div className="card">
        <h1>My Portfolio</h1>
        <p>
          A collection of projects showcasing skills in full-stack development, mobile apps, and
          emerging technologies.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="portfolio-grid">
          {items.map(item => <ProjectCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="card">
          <p style={{ opacity: 0.6 }}>No portfolio items available yet.</p>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h2>Want to see more?</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Check out my GitHub profile for more projects and open source contributions.
        </p>
        <a href="https://github.com/johndoe" className="link-button" target="_blank" rel="noopener noreferrer"
           style={{ display: 'inline-block', margin: 0 }}>
          🐱 Visit My GitHub
        </a>
      </div>
    </div>
  )
}
