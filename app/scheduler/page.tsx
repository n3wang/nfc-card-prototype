'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SchedulerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    meetingType: '',
    preferredDate: '',
    preferredTime: '',
    duration: '30',
    message: ''
  })
  
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd send this to your backend or scheduling service
    console.log('Meeting request submitted:', formData)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="page-container">
        <Link href="/" className="back-button">
          ← Back to Home
        </Link>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1>Meeting Request Submitted!</h1>
          <p>
            Thanks for reaching out! I'll review your meeting request and get back to you 
            within 24 hours to confirm the details.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            In the meantime, feel free to check out my portfolio or connect with me on social media.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/" className="link-button" style={{ display: 'inline-block', margin: '0 0.5rem' }}>
              Back to Home
            </Link>
            <Link href="/portfolio" className="link-button" style={{ display: 'inline-block', margin: '0 0.5rem' }}>
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <div className="card">
        <h1>Schedule a Meeting</h1>
        <p>
          I'd love to chat! Whether you want to discuss a potential project, 
          collaboration opportunity, or just want to connect, feel free to schedule 
          a meeting with me.
        </p>
      </div>

      <div className="card">
        <h2>Available Meeting Types</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>☕ Coffee Chat (30 min)</h3>
            <p>Casual conversation about tech, career, or industry trends</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>💼 Project Discussion (45 min)</h3>
            <p>Deep dive into your project requirements and technical needs</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>🤝 Consultation (60 min)</h3>
            <p>Comprehensive technical consultation and solution planning</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="scheduler-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meetingType">Meeting Type *</label>
            <select
              id="meetingType"
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              required
            >
              <option value="">Select a meeting type</option>
              <option value="coffee-chat">Coffee Chat (30 min)</option>
              <option value="project-discussion">Project Discussion (45 min)</option>
              <option value="consultation">Consultation (60 min)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="preferredDate">Preferred Date *</label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Preferred Time *</label>
              <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell me a bit about what you'd like to discuss..."
              rows={4}
            />
          </div>

          <button type="submit" className="submit-button">
            Schedule Meeting
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>
            <strong>Note:</strong> All times are in PST. I'll send you a calendar invitation 
            once I confirm the meeting time. If you need to schedule outside business hours 
            or have urgent requests, please mention it in the message above.
          </p>
        </div>
      </div>
    </div>
  )
}