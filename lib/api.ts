const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type ProfileDetail = {
  header: string
  value: string
  link: string | null
}

export type ProfileItem = {
  id: string
  category: string
  title: string
  subtitle: string | null
  year: string | null
  description: string | null
  metadata: Record<string, unknown>
  status: string
  sortOrder: number
  isPublic: boolean
}

export type Profile = {
  id: string
  profileSlug: string
  userSlug: string
  displayName: string
  title: string | null
  bio: string | null
  avatarUrl: string | null
  themePreference: string
  isPublic: boolean
  details: ProfileDetail[]
  items: ProfileItem[] | null
}

export type AvailabilitySlot = {
  startTime: string
  endTime: string
  timezone: string
}

export type AvailabilityBlock = {
  dayOfWeek: number
  startTime: string
  endTime: string
  timezone: string
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export async function getProfile(slug: string): Promise<Profile | null> {
  const data = await apiFetch<{ profile: Profile }>(`/api/profiles/${slug}`)
  return data?.profile ?? null
}

export async function getResume(slug: string): Promise<ProfileItem[]> {
  const data = await apiFetch<{ resume: { items: ProfileItem[] } }>(`/api/profiles/${slug}/resume`)
  return data?.resume?.items ?? []
}

export async function getPortfolio(slug: string): Promise<ProfileItem[]> {
  const data = await apiFetch<{ items: ProfileItem[] }>(`/api/profiles/${slug}/portfolio`)
  return data?.items ?? []
}

export async function getAvailableSlots(
  slug: string,
  date: string,
  duration: number
): Promise<AvailabilitySlot[]> {
  const data = await apiFetch<{ available_slots: AvailabilitySlot[] }>(
    `/api/profiles/${slug}/availability/slots?date=${date}&duration=${duration}`
  )
  return data?.available_slots ?? []
}

export async function getAvailability(slug: string): Promise<AvailabilityBlock[]> {
  const data = await apiFetch<{
    availability: Array<{
      day_of_week?: number
      dayOfWeek?: number
      start_time?: string
      startTime?: string
      end_time?: string
      endTime?: string
      timezone?: string
    }>
  }>(`/api/profiles/${slug}/availability`)

  return (data?.availability ?? [])
    .map(item => ({
      dayOfWeek: item.dayOfWeek ?? item.day_of_week ?? -1,
      startTime: item.startTime ?? item.start_time ?? '',
      endTime: item.endTime ?? item.end_time ?? '',
      timezone: item.timezone ?? 'UTC',
    }))
    .filter(item => item.dayOfWeek >= 0 && item.startTime && item.endTime)
}

export async function updateProfile(
  slug: string,
  data: {
    displayName?: string
    title?: string
    bio?: string
    themePreference?: string
    details?: ProfileDetail[]
  },
  token: string
): Promise<Profile | null> {
  const result = await apiFetch<{ profile: Profile }>(`/api/profiles/${slug}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return result?.profile ?? null
}

export async function bookMeeting(
  slug: string,
  payload: {
    meetingKind: string
    durationMinutes: number
    attendeeName: string
    attendeeEmail: string
    scheduledDate: string
    scheduledTime: string
    timezone: string
    message?: string
  }
): Promise<{ booking: { id: string; confirmationCode: string } } | null> {
  return apiFetch(`/api/profiles/${slug}/meetings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
