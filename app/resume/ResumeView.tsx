'use client'

import Link from 'next/link'
import { bookMeeting } from '../../lib/api'
import { useMemo, useState } from 'react'
import type { AvailabilityBlock, Profile, ProfileItem } from '../../lib/api'

type ResumeViewProps = {
  profile: Profile | null
  items: ProfileItem[]
  availability: AvailabilityBlock[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MEETING_KINDS: Record<string, { label: string; duration: number; kind: string }> = {
  coffee_chat: { label: 'Coffee Chat (30 min)', duration: 30, kind: 'coffee_chat' },
  demo: { label: 'Project Discussion (45 min)', duration: 45, kind: 'demo' },
  mentoring: { label: 'Consultation (60 min)', duration: 60, kind: 'mentoring' },
  custom: { label: 'Custom', duration: 30, kind: 'custom' },
}

function extractTags(items: ProfileItem[]): string[] {
  return Array.from(
    new Set(
      items
        .filter(i => i.category === 'skill')
        .map(i => i.title.trim())
        .filter(Boolean)
    )
  )
}

function getTextForFilter(item: ProfileItem): string {
  const metadataText = JSON.stringify(item.metadata ?? {})
  return `${item.title} ${item.subtitle ?? ''} ${item.description ?? ''} ${metadataText}`.toLowerCase()
}

function DetailList({ profile }: { profile: Profile | null }) {
  const details = profile?.details ?? []
  const links = details.filter(d => d.header.toLowerCase() === 'links')
  const contacts = details.filter(d => d.header.toLowerCase() === 'contact')
  const locations = details.filter(d => d.header.toLowerCase() === 'location')

  return (
    <div className="career-details">
      {locations.length > 0 && (
        <div>
          <span className="career-label">Location</span>
          <span>{locations.map(l => l.value).join(' · ')}</span>
        </div>
      )}
      {contacts.length > 0 && (
        <div>
          <span className="career-label">Contact</span>
          <span>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 ? ' · ' : ''}
                {c.link ? <a href={c.link}>{c.value}</a> : c.value}
              </span>
            ))}
          </span>
        </div>
      )}
      {links.length > 0 && (
        <div>
          <span className="career-label">Links</span>
          <span>
            {links.map((l, i) => (
              <span key={i}>
                {i > 0 ? ' · ' : ''}
                {l.link ? (
                  <a href={l.link} target="_blank" rel="noopener noreferrer">{l.value}</a>
                ) : (
                  l.value
                )}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  )
}

export default function ResumeView({ profile, items, availability }: ResumeViewProps) {
  const tags = useMemo(() => extractTags(items), [items])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [selectedBlock, setSelectedBlock] = useState<{
    dayIdx: number
    startTime: string
    endTime: string
    timezone: string
  } | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    meetingType: 'coffee_chat',
    duration: '30',
    message: '',
  })

  const nextDateForDay = (dayIdx: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    const delta = (dayIdx - currentDay + 7) % 7
    const target = new Date(today)
    target.setDate(today.getDate() + delta)
    const y = target.getFullYear()
    const m = String(target.getMonth() + 1).padStart(2, '0')
    const d = String(target.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBookingForm(prev => ({ ...prev, [name]: value }))
    if (name === 'meetingType' && MEETING_KINDS[value]) {
      setBookingForm(prev => ({ ...prev, meetingType: value, duration: String(MEETING_KINDS[value].duration) }))
    }
  }

  const openBookingModal = (block: { dayIdx: number; startTime: string; endTime: string; timezone: string }) => {
    setSelectedBlock(block)
    setBookingError(null)
    setConfirmationCode(null)
    setBookingForm(prev => ({
      ...prev,
      meetingType: prev.meetingType || 'coffee_chat',
      duration: prev.duration || '30',
    }))
    setIsBookingOpen(true)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBlock || !profile?.profileSlug) return

    setSubmitting(true)
    setBookingError(null)

    const meetingKind = MEETING_KINDS[bookingForm.meetingType]?.kind ?? bookingForm.meetingType
    const result = await bookMeeting(profile.profileSlug, {
      meetingKind,
      durationMinutes: parseInt(bookingForm.duration),
      attendeeName: bookingForm.name,
      attendeeEmail: bookingForm.email,
      scheduledDate: nextDateForDay(selectedBlock.dayIdx),
      scheduledTime: selectedBlock.startTime,
      timezone: selectedBlock.timezone,
      message: bookingForm.message || undefined,
    })

    setSubmitting(false)

    if (result?.booking?.confirmationCode) {
      setConfirmationCode(result.booking.confirmationCode)
      setIsBookingOpen(false)
    } else {
      setBookingError('Could not create the meeting for this time block.')
    }
  }

  const matchesTags = (item: ProfileItem): boolean => {
    if (activeTags.length === 0) return true
    const haystack = getTextForFilter(item)
    return activeTags.some(tag => haystack.includes(tag.toLowerCase()))
  }

  const experiences = items.filter(i => i.category === 'experience' && matchesTags(i))
  const educations = items.filter(i => i.category === 'education')
  const certifications = items.filter(i => i.category === 'certification')
  const filteredSkills = items.filter(i => i.category === 'skill' && matchesTags(i))

  const availabilityRows = useMemo(() => {
    return [...availability].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })
  }, [availability])

  const initials = (profile?.displayName ?? 'JD')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="page-container career-page">
      <Link href="/" className="back-button">Back to Home</Link>

      <section className="career-shell">
        <div className="career-header">
          <div className="career-identity">
            <div className="career-avatar">{initials}</div>
            <div>
              <h1>{profile?.displayName ?? 'Career Profile'}</h1>
              <p className="career-title">{profile?.title ?? 'Professional Profile'}</p>
            </div>
          </div>
          <DetailList profile={profile} />
        </div>

        <div className="career-summary">
          <h2>Summary</h2>
          <p>{profile?.bio ?? 'Profile summary not available yet.'}</p>
        </div>

        <div className="career-grid">
          <section className="career-panel">
            <div className="career-panel-title-row">
              <h3>Skill Tags</h3>
              {activeTags.length > 0 && (
                <button type="button" onClick={() => setActiveTags([])} className="career-clear-btn">
                  Clear Filter
                </button>
              )}
            </div>
            <div className="career-tags">
              {tags.map(tag => {
                const active = activeTags.includes(tag)
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`career-tag ${active ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
            <div className="career-skill-list">
              {filteredSkills.map(skill => (
                <div key={skill.id} className="career-line-item">
                  <strong>{skill.title}</strong>
                  {skill.subtitle ? <span>{skill.subtitle}</span> : null}
                </div>
              ))}
              {filteredSkills.length === 0 && <p className="career-empty">No skills match selected tags.</p>}
            </div>
          </section>

          <section className="career-panel">
            <h3>Availability Time Blocks</h3>
            <div className="availability-table-wrap">
              <table className="availability-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Next Date</th>
                    <th>Time Block</th>
                    <th>Timezone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {availabilityRows.map((block, index) => {
                    const isSelected =
                      selectedBlock?.dayIdx === block.dayOfWeek &&
                      selectedBlock?.startTime === block.startTime &&
                      selectedBlock?.endTime === block.endTime

                    return (
                      <tr key={`${block.dayOfWeek}-${block.startTime}-${index}`} className={isSelected ? 'selected' : ''}>
                        <td>{DAYS[block.dayOfWeek]}</td>
                        <td>{nextDateForDay(block.dayOfWeek)}</td>
                        <td>{block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}</td>
                        <td>{block.timezone}</td>
                        <td>
                          <button
                            type="button"
                            className="availability-select-btn"
                            onClick={() => openBookingModal({
                              dayIdx: block.dayOfWeek,
                              startTime: block.startTime,
                              endTime: block.endTime,
                              timezone: block.timezone,
                            })}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {confirmationCode && (
              <p className="career-empty" style={{ marginTop: '0.75rem' }}>
                Meeting created. Confirmation code: {confirmationCode}
              </p>
            )}
          </section>
        </div>

        <section className="career-panel">
          <h3>Experience</h3>
          <div className="career-list">
            {experiences.map(exp => (
              <article key={exp.id} className="career-item">
                <div className="career-item-head">
                  <h4>{exp.title}</h4>
                  {exp.year ? <span>{exp.year}</span> : null}
                </div>
                {exp.subtitle ? <p className="career-item-subtitle">{exp.subtitle}</p> : null}
                {exp.description ? <p>{exp.description}</p> : null}
              </article>
            ))}
            {experiences.length === 0 && <p className="career-empty">No experience entries match selected tags.</p>}
          </div>
        </section>

        <div className="career-grid career-grid-bottom">
          <section className="career-panel">
            <h3>Education</h3>
            <div className="career-list compact">
              {educations.map(ed => (
                <article key={ed.id} className="career-item">
                  <div className="career-item-head">
                    <h4>{ed.title}</h4>
                    {ed.year ? <span>{ed.year}</span> : null}
                  </div>
                  {ed.subtitle ? <p className="career-item-subtitle">{ed.subtitle}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="career-panel">
            <h3>Certifications</h3>
            <div className="career-list compact">
              {certifications.map(cert => (
                <article key={cert.id} className="career-item">
                  <div className="career-item-head">
                    <h4>{cert.title}</h4>
                    {cert.year ? <span>{cert.year}</span> : null}
                  </div>
                  {cert.subtitle ? <p className="career-item-subtitle">{cert.subtitle}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      {isBookingOpen && selectedBlock && (
        <div className="booking-modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>Create Meeting</h3>
              <button type="button" className="planner-nav-btn" onClick={() => setIsBookingOpen(false)}>
                Close
              </button>
            </div>

            <p className="career-empty" style={{ marginBottom: '1rem' }}>
              {DAYS[selectedBlock.dayIdx]} {nextDateForDay(selectedBlock.dayIdx)} at {selectedBlock.startTime.slice(0, 5)}-{selectedBlock.endTime.slice(0, 5)} ({selectedBlock.timezone})
            </p>

            <form onSubmit={handleBookingSubmit} className="scheduler-form">
              <div className="form-group">
                <label htmlFor="meetingType">Meeting Type *</label>
                <select id="meetingType" name="meetingType" value={bookingForm.meetingType} onChange={handleBookingChange} required>
                  {Object.entries(MEETING_KINDS).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <select id="duration" name="duration" value={bookingForm.duration} onChange={handleBookingChange}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input id="name" name="name" type="text" value={bookingForm.name} onChange={handleBookingChange} required placeholder="Your full name" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input id="email" name="email" type="email" value={bookingForm.email} onChange={handleBookingChange} required placeholder="your.email@example.com" />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={4} value={bookingForm.message} onChange={handleBookingChange} placeholder="Tell me what you'd like to discuss..." />
              </div>

              {bookingError && <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{bookingError}</p>}

              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'Booking...' : 'Create Meeting'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
