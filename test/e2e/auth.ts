import type { Page } from '@playwright/test'

/**
 * A stand-in for the Supabase project (playwright.config.ts builds the site against
 * https://supabase.test): a signed-in session in the browser, and answers to the database call the app
 * makes (`is_premium`). Google itself can't be driven by a test; the login page is checked up to
 * the redirect to it.
 */
export const SUPABASE_URL = 'https://supabase.test'
/** Where supabase-js keeps the session: `sb-<first part of the project host>-auth-token`. */
const STORAGE_KEY = 'sb-supabase-auth-token'

export interface FakeAccount {
  /** Flip it to change what the next page load sees (the app checks on every load). */
  premium: boolean
  signedIn: boolean
}

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')

/** Answers every request to the fake project. Call before the first `page.goto`. */
export async function fakeSupabase(page: Page, account: FakeAccount) {
  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const url = new URL(route.request().url())
    const json = (body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname === '/rest/v1/rpc/is_premium') return json(account.signedIn && account.premium)
    if (url.pathname === '/auth/v1/logout') {
      account.signedIn = false
      return route.fulfill({ status: 204 })
    }
    if (url.pathname === '/auth/v1/authorize') return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Google</p>' })
    return json({})
  })
}

/** Signs the page in as a Free account (or Premium), with a session that won't expire during the test. */
export async function signIn(page: Page, { premium = false } = {}): Promise<FakeAccount> {
  const account: FakeAccount = { premium, signedIn: true }
  await fakeSupabase(page, account)
  const expiresAt = Math.floor(Date.now() / 1000) + 3600 * 24
  const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'candidate@example.com' }
  const accessToken = [base64url({ alg: 'HS256', typ: 'JWT' }), base64url({ sub: user.id, email: user.email, role: 'authenticated', exp: expiresAt }), 'signature'].join('.')
  const session = { access_token: accessToken, token_type: 'bearer', expires_in: 3600 * 24, expires_at: expiresAt, refresh_token: 'refresh-token', user }
  // Once per tab: after "Sign out" the session must stay gone on the next page loads.
  await page.addInitScript(([key, value]) => {
    if (sessionStorage.getItem('e2e-signed-in')) return
    sessionStorage.setItem('e2e-signed-in', '1')
    localStorage.setItem(key, value)
  }, [STORAGE_KEY, JSON.stringify(session)] as const)
  return account
}
