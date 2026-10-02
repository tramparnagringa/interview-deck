/** Who is looking at the app: known once the Supabase session has been read in the browser. */
export interface Viewer {
  signedIn: boolean
  premium: boolean
}

export const LOGIN_PATH = '/login'
/** Pages anyone can open, signed in or not. */
const PUBLIC_PATHS = ['/about']

/** Pages whose content doesn't depend on who is looking: they can be prerendered with their content. */
export const isPublicPath = (path: string) => path === LOGIN_PATH || PUBLIC_PATHS.includes(path)

/** A redirect: a path, or the login with where to go next (as a query object, so the router encodes it). */
export type Redirect = string | { path: typeof LOGIN_PATH, query: { next: string } }

const isPremiumPath = (path: string) => path === '/premium' || path.startsWith('/premium/')

/** Where a viewer starts: Premium members on the Premium pages. */
export function homeFor(viewer: Viewer): string {
  return viewer.premium ? '/premium' : '/'
}

/** The `next` query param, only if it is a path on this site (never another host, never the login itself). */
export function safeNext(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  if (value === LOGIN_PATH || value.startsWith(`${LOGIN_PATH}?`)) return null
  return value
}

/**
 * Where to send the viewer instead of the page they asked for, or null to let them in.
 * - Everything but the public pages needs a signed-in account; the login page remembers where they were going.
 * - Premium members use the Premium pages (`/play/x` → `/premium/play/x`); everyone else the Free ones.
 * `path` is the route path; `fullPath` includes the query, kept across redirects.
 */
export function redirectFor(path: string, fullPath: string, viewer: Viewer, next: string | null = null): Redirect | null {
  if (path === LOGIN_PATH) return viewer.signedIn ? (next ?? homeFor(viewer)) : null
  if (PUBLIC_PATHS.includes(path)) return null
  if (!viewer.signedIn) return { path: LOGIN_PATH, query: { next: fullPath } }

  if (viewer.premium && !isPremiumPath(path)) {
    const rest = fullPath === '/' ? '' : fullPath.startsWith('/?') ? fullPath.slice(1) : fullPath
    return `/premium${rest}`
  }
  if (!viewer.premium && isPremiumPath(path)) {
    const query = fullPath.slice(path.length)
    return path.startsWith('/premium/play/') ? path.slice('/premium'.length) + query : '/'
  }
  return null
}
