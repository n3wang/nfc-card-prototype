import Link from 'next/link'
import { getProfile, getResume } from '../lib/api'

const SAMPLE_PROFILES = [
  { slug: 'sarah-chen', fallbackName: 'Sarah Chen' },
  { slug: 'marcus-johnson', fallbackName: 'Marcus Johnson' },
  { slug: 'priya-patel', fallbackName: 'Priya Patel' },
  { slug: 'alex-rivera', fallbackName: 'Alex Rivera' },
] as const

function findLocation(details: Array<{ header: string; value: string }>): string {
  const location = details.find(d => d.header.toLowerCase() === 'location')
  return location?.value ?? 'Location not provided'
}

export default async function HomePage() {
  const cards = await Promise.all(
    SAMPLE_PROFILES.map(async ({ slug, fallbackName }) => {
      const [profile, resume] = await Promise.all([getProfile(slug), getResume(slug)])

      const displayName = profile?.displayName ?? fallbackName
      const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      const experienceCount = resume.filter(item => item.category === 'experience').length
      const skillCount = resume.filter(item => item.category === 'skill').length
      const topSkill = resume.find(item => item.category === 'skill')?.title ?? 'No skill data'
      const location = findLocation(profile?.details ?? [])

      return {
        slug,
        displayName,
        initials,
        title: profile?.title ?? 'Professional Profile',
        bio: profile?.bio ?? 'No summary available yet.',
        location,
        experienceCount,
        skillCount,
        topSkill,
      }
    })
  )

  return (
    <div className="page-container career-page" style={{ maxWidth: 1100 }}>
      <section className="career-shell">
        <div className="career-summary" style={{ marginBottom: '1rem' }}>
          <h1 style={{ marginBottom: '0.4rem' }}>Career Profiles</h1>
          <p>
            Browse resume previews and open each portfolio directly.
          </p>
        </div>

        <div className="career-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {cards.map(card => (
            <article key={card.slug} className="career-panel">
              <div className="career-identity" style={{ marginBottom: '0.5rem' }}>
                <div className="career-avatar">{card.initials}</div>
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>{card.displayName}</h3>
                  <p className="career-title" style={{ marginBottom: 0 }}>{card.title}</p>
                </div>
              </div>

              <div className="career-details" style={{ marginBottom: '0.65rem' }}>
                <div>
                  <span className="career-label">Location</span>
                  <span>{card.location}</span>
                </div>
                <div>
                  <span className="career-label">Preview</span>
                  <span>{card.experienceCount} experiences · {card.skillCount} skills</span>
                </div>
                <div>
                  <span className="career-label">Top Skill</span>
                  <span>{card.topSkill}</span>
                </div>
              </div>

              <p style={{ color: '#415a70', marginBottom: '0.9rem' }}>{card.bio}</p>

              <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                <Link href={`/resume?slug=${card.slug}`} className="link-button" style={{ margin: 0, padding: '0.55rem 0.8rem', fontSize: '0.9rem' }}>
                  View Resume
                </Link>
                <Link href={`/portfolio?slug=${card.slug}`} className="link-button" style={{ margin: 0, padding: '0.55rem 0.8rem', fontSize: '0.9rem' }}>
                  View Portfolio
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="career-summary" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <p>
            Tip: each card keeps the selected profile slug in the URL, so resume and portfolio pages open the correct person.
          </p>
        </div>
      </section>
    </div>
  )
}
