import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import type { Plan } from '#shared/schemas/plan'
import { resolvePlan, type SessionClaims } from '#shared/utils/plan'

export interface Viewer {
  userId: string | null
  email: string | null
  isAnonymous: boolean
  plan: Plan
}

type Claims = SessionClaims

async function readClaims(event: H3Event): Promise<Claims | null> {
  try {
    return (await serverSupabaseUser(event)) as Claims | null
  }
  catch {
    // Missing or expired session: treat as a logged-out Free visitor.
    return null
  }
}

export async function isActivePremiumMember(event: H3Event, email: string): Promise<boolean> {
  const { data, error } = await useAdminDb(event)
    .from('premium_members')
    .select('email')
    .eq('email', email.toLowerCase())
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not check membership' })
  return data !== null
}

/** Who is calling and on which plan. Always decided here, never on the client. Cached per request. */
export async function getViewer(event: H3Event): Promise<Viewer> {
  const cached = event.context.viewer as Viewer | undefined
  if (cached) return cached

  const claims = await readClaims(event)
  const email = claims?.email && !claims.is_anonymous ? claims.email.toLowerCase() : null
  const member = email ? await isActivePremiumMember(event, email) : false

  const viewer: Viewer = {
    userId: claims?.sub ?? null,
    email,
    isAnonymous: claims?.is_anonymous ?? !claims,
    plan: resolvePlan(claims, member),
  }
  event.context.viewer = viewer
  return viewer
}

export async function requireUser(event: H3Event): Promise<Viewer & { userId: string }> {
  const viewer = await getViewer(event)
  if (!viewer.userId) throw createError({ statusCode: 401, statusMessage: 'Session required' })
  return viewer as Viewer & { userId: string }
}
