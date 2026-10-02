import { expect, test, type Page } from '@playwright/test'
import { fakeSupabase, signIn, SUPABASE_URL } from './auth'

/** On the login page, remembering `next` (read as a parameter: the router doesn't encode its slashes). */
async function expectLogin(page: Page, next: string) {
  await expect(page).toHaveURL(/\/login\?/)
  await expect.poll(() => new URL(page.url()).searchParams.get('next')).toBe(next)
}

test.describe('signed out', () => {
  test.beforeEach(async ({ page }) => {
    await fakeSupabase(page, { signedIn: false, premium: false })
  })

  test('every page asks to sign in, then sends Google back to where the viewer was going', async ({ page }, testInfo) => {
    await page.goto('/play/general')
    await expectLogin(page, '/play/general')
    await expect(page.getByRole('heading', { name: 'Practice interviews out loud.' })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('00-login.png'), fullPage: true })

    const authorize = page.waitForRequest(request => request.url().startsWith(`${SUPABASE_URL}/auth/v1/authorize`))
    await page.getByRole('button', { name: 'Continue with Google' }).click()
    const url = new URL((await authorize).url())
    expect(url.searchParams.get('provider')).toBe('google')
    const back = new URL(url.searchParams.get('redirect_to')!)
    expect(back.pathname).toBe('/login')
    expect(back.searchParams.get('next')).toBe('/play/general')
  })

  test('the about page is open to everyone', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  })
})

test.describe('inside an app', () => {
  test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]' })

  test('asks to open the page in the browser, where Google sign-in works', async ({ page }) => {
    await fakeSupabase(page, { signedIn: false, premium: false })
    await page.goto('/login')
    await expect(page.getByRole('alert')).toContainText('Open this page in your browser')
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible()
  })
})

test.describe('signed in', () => {
  test('Free accounts use the Free pages', async ({ page }) => {
    await signIn(page)
    await page.goto('/login')
    await expect(page).toHaveURL(/\/$/)
    await page.goto('/premium/play/general')
    await expect(page).toHaveURL(/\/play\/general$/)
    await expect(page.getByText('Premium', { exact: true })).toHaveCount(0)
  })

  test('Premium accounts are taken to the Premium pages', async ({ page }) => {
    await signIn(page, { premium: true })
    await page.goto('/')
    await expect(page).toHaveURL(/\/premium$/)
    await expect(page.getByText('Premium', { exact: true })).toBeVisible()
    await page.goto('/play/general')
    await expect(page).toHaveURL(/\/premium\/play\/general$/)
  })

  test('sign out goes back to the login, for good', async ({ page }) => {
    await signIn(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/')
    await expectLogin(page, '/')
  })
})
