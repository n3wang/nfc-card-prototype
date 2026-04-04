'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAvailableSlots, bookMeeting, type AvailabilitySlot } from '../../lib/api'

const PROFILE_SLUG = process.env.NEXT_PUBLIC_PROFILE_SLUG || 'john-doe'

const MEETING_KINDS: Record<string, { label: string; duration: number; kind: string }> = {
  'coffee_chat':  { label: 'Coffee Chat (30 min)',       duration: 30, kind: 'coffee_chat' },
  'demo':         { label: 'Project Discussion (45 min)', duration: 45, kind: 'demo' },
  'mentoring':    { label: 'Consultation (60 min)',       duration: 60, kind: 'mentoring' },
  'custom':       { label: 'Custom',                      duration: 30, kind: 'custom' },
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(base.getDate() + days)
  return next
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function SchedulerPage() {
  const searchParams = useSearchParams()
  const today = useMemo(() => new Date(), [])
  const activeSlug = searchParams.get('slug') || PROFILE_SLUG

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    meetingType: '',
    preferredDate: '',
    preferredTime: '',
    duration: '30',
    message: '',
  })

  const [weekOffset, setWeekOffset] = useState(0)
  const [weeklySlots, setWeeklySlots] = useState<Record<string, AvailabilitySlot[]>>({})
  const [loadingPlanner, setLoadingPlanner] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const weekDates = useMemo(() => {
    const start = addDays(today, weekOffset * 7)
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx))
  }, [today, weekOffset])

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const durationParam = searchParams.get('duration')
    const kindParam = searchParams.get('meetingKind')

    if (!dateParam && !timeParam && !durationParam && !kindParam) return

    setFormData(prev => ({
      ...prev,
      preferredDate: dateParam || prev.preferredDate,
      preferredTime: timeParam ? `${timeParam}:00`.slice(0, 8) : prev.preferredTime,
      duration: durationParam || prev.duration,
      meetingType: kindParam || prev.meetingType,
    }))

    if (dateParam) {
      const target = new Date(`${dateParam}T00:00:00`)
      const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays >= 0) {
        setWeekOffset(Math.floor(diffDays / 7))
      }
    }
  }, [searchParams, today])

  const loadWeeklyPlanner = useCallback(async () => {
    if (!formData.duration) return
    setLoadingPlanner(true)
    const fetched = await Promise.all(
      weekDates.map(async date => {
        const dateStr = formatDateInput(date)
        const slots = await getAvailableSlots(activeSlug, dateStr, parseInt(formData.duration))
        return [dateStr, slots] as const
      })
    )

    const asMap = fetched.reduce((acc, [dateStr, slots]) => {
      acc[dateStr] = slots
      return acc
    }, {} as Record<string, AvailabilitySlot[]>)

    setWeeklySlots(asMap)
    setLoadingPlanner(false)
  }, [activeSlug, formData.duration, weekDates])

  useEffect(() => {
    loadWeeklyPlanner()
  }, [loadWeeklyPlanner])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
    // When meeting type changes, sync duration
    if (name === 'meetingType' && MEETING_KINDS[value]) {
      setFormData(f => ({ ...f, meetingType: value, duration: String(MEETING_KINDS[value].duration) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const meetingKind = MEETING_KINDS[formData.meetingType]?.kind ?? formData.meetingType
    const scheduledTime = formData.preferredTime.length === 5
      ? formData.preferredTime + ':00'
      : formData.preferredTime

    const result = await bookMeeting(activeSlug, {
      meetingKind,
      durationMinutes: parseInt(formData.duration),
      attendeeName: formData.name,
      attendeeEmail: formData.email,
      scheduledDate: formData.preferredDate,
      scheduledTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message: formData.message || undefined,
    })

    setSubmitting(false)

    if (result?.booking) {
      setIsModalOpen(false)
      setConfirmationCode(result.booking.confirmationCode)
    } else {
      setError('Could not book the meeting. That slot may be taken or the server is unavailable.')
    }
  }

  const handleSlotClick = (dateStr: string, slot: AvailabilitySlot) => {
    setFormData(prev => ({
      ...prev,
      preferredDate: dateStr,
      preferredTime: slot.startTime,
      meetingType: prev.meetingType || 'coffee_chat',
    }))
    setError(null)
    setIsModalOpen(true)
  }

  if (confirmationCode) {
    return (
      <div className="page-container">
        <Link href="/" className="back-button">← Back to Home</Link>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>Confirmed</div>
          <h1>Meeting Booked!</h1>
          <p>Your confirmation code is <strong>{confirmationCode}</strong>.</p>
          <p style={{ marginTop: '1rem' }}>I'll be in touch to confirm the details.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/" className="link-button" style={{ display: 'inline-block', margin: '0 0.5rem' }}>
              Back to Home
            </Link>
            <Link href={`/portfolio?slug=${activeSlug}`} className="link-button" style={{ display: 'inline-block', margin: '0 0.5rem' }}>
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Link href="/" className="back-button">← Back to Home</Link>

      <div className="card">
        <h1>Schedule a Meeting</h1>
        <p>
          Choose a week, click an available time block, then confirm your booking details.
        </p>
      </div>

      <div className="card">
        <h2>Available Meeting Types</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {Object.values(MEETING_KINDS).map(m => (
            <div key={m.kind} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: 8 }}>
              <h3>{m.label}</h3>
            </div>
          ))}
        </div>

        <div className="planner-nav">
          <button type="button" className="planner-nav-btn" onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}>
            Previous Week
          </button>
          <p className="planner-nav-label">
            Week of {formatDayLabel(weekDates[0])}
          </p>
          <button type="button" className="planner-nav-btn" onClick={() => setWeekOffset(w => w + 1)}>
            Next Week
          </button>
        </div>

        <div className="planner-grid">
          {weekDates.map(date => {
            const dateStr = formatDateInput(date)
            const slots = weeklySlots[dateStr] ?? []
            return (
              <div key={dateStr} className="planner-day-column">
                <h4>{formatDayLabel(date)}</h4>
                {loadingPlanner ? (
                  <p className="planner-day-empty">Loading...</p>
                ) : slots.length > 0 ? (
                  <div className="planner-slots">
                    {slots.map((slot, idx) => {
                      const isSelected = formData.preferredDate === dateStr && formData.preferredTime === slot.startTime
                      return (
                        <button
                          key={`${dateStr}-${idx}`}
                          type="button"
                          className={`planner-slot-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSlotClick(dateStr, slot)}
                        >
                          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="planner-day-empty">No slots</p>
                )}
              </div>
            )
          })}
        </div>

        <p className="planner-day-empty">
          Click an available time block to open booking details.
        </p>
      </div>

      {isModalOpen && (
        <div className="booking-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>Create Meeting</h3>
              <button type="button" className="planner-nav-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="scheduler-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="preferredDate">Date *</label>
                  <input type="date" id="preferredDate" name="preferredDate" value={formData.preferredDate}
                    onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="form-group">
                  <label htmlFor="preferredTime">Time *</label>
                  <input type="time" id="preferredTime" name="preferredTime" value={formData.preferredTime.slice(0, 5)}
                    onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="meetingType">Meeting Type *</label>
                <select id="meetingType" name="meetingType" value={formData.meetingType}
                  onChange={handleChange} required>
                  <option value="">Select a meeting type</option>
                  {Object.entries(MEETING_KINDS).map(([key, m]) => (
                    <option key={key} value={key}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <select id="duration" name="duration" value={formData.duration} onChange={handleChange}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" name="name" value={formData.name}
                  onChange={handleChange} required placeholder="Your full name" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="your.email@example.com" />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange}
                  placeholder="Tell me what you'd like to discuss..." rows={4} />
              </div>

              {error && (
                <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</p>
              )}

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
