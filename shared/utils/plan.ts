import type { Plan } from '../schemas/plan'

export interface SessionClaims {
  sub?: string
  email?: string
  is_anonymous?: boolean
}

/** Premium requires a real (non-anonymous) account whose email is an active Premium member. */
export function resolvePlan(claims: SessionClaims | null, isActiveMember: boolean): Plan {
  if (!claims?.sub || claims.is_anonymous || !claims.email) return 'free'
  return isActiveMember ? 'premium' : 'free'
}
