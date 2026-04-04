import { getAvailability, getProfile, getResume } from '../../lib/api'
import ResumeView from './ResumeView'

const PROFILE_SLUG = process.env.NEXT_PUBLIC_PROFILE_SLUG || 'john-doe'

type ResumePageProps = {
  searchParams?: Promise<{ slug?: string | string[] }>
}

export default async function ResumePage({ searchParams }: ResumePageProps) {
  const params = searchParams ? await searchParams : undefined
  const requestedSlug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug
  const slug = requestedSlug || PROFILE_SLUG

  const [profile, items, availability] = await Promise.all([
    getProfile(slug),
    getResume(slug),
    getAvailability(slug),
  ])

  return <ResumeView profile={profile} items={items} availability={availability} />
}
