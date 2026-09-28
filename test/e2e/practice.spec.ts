import { expect, test, type Page } from '@playwright/test'

const question = (page: Page) => page.getByRole('heading', { level: 1 })
// The timer status line (the route announcer is also a status region).
const status = (page: Page) => page.getByRole('status').filter({ hasText: /Speak now|Paused|Time is up/ })
const counter = (page: Page, text: string) => page.getByText(new RegExp(`^${text}$`))

/** Clicks "Next card" and waits for the card animation to show a different question. */
async function nextCard(page: Page) {
  const previous = await question(page).innerText()
  await page.getByRole('button', { name: 'Next card' }).click()
  await expect(question(page)).not.toHaveText(previous)
}

/** Every session starts with a warm-up and an intro; skip them to reach the first deck question. */
async function skipToCore(page: Page) {
  await expect(counter(page, 'Warm-up')).toBeVisible()
  await nextCard(page)
  await expect(counter(page, 'Intro')).toBeVisible()
  await nextCard(page)
  await expect(counter(page, '1 of \\d+')).toBeVisible()
}

test.describe('free practice', () => {
  test('home shows the free deck and one Skool CTA, without modes', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.getByRole('group', { name: 'Decks' }).getByRole('button')).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Draw a card from the deck' })).toBeVisible()
    await expect(page.getByRole('radiogroup', { name: 'Mode' })).toHaveCount(0)
    const cta = page.getByRole('link', { name: /Go further with Premium/ })
    await expect(cta).toHaveAttribute('href', 'https://www.skool.com/test')
    // One CTA per screen (the menu's community link is hidden until the menu opens).
    await expect(page.locator('a[href*="skool.com"]:visible')).toHaveCount(1)
    await page.screenshot({ path: testInfo.outputPath('01-home.png'), fullPage: true })
  })

  test('a session follows the interview: warm-up, intro, deck without repeats', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Shuffle & draw' }).click()
    await expect(page).toHaveURL(/\/play\/general$/)
    await expect(counter(page, 'Warm-up')).toBeVisible()
    await expect(page.getByRole('button', { name: /Answer out loud · 0:30/ })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('02-warm-up.png'), fullPage: true })

    await nextCard(page)
    await expect(counter(page, 'Intro')).toBeVisible()
    await expect(page.getByRole('button', { name: /Answer out loud · 2:00/ })).toBeVisible()
    await nextCard(page)

    const seen = new Set<string>()
    for (let i = 1; i <= 5; i++) {
      await expect(counter(page, `${i} of \\d+`)).toBeVisible()
      const text = await question(page).innerText()
      expect(seen.has(text)).toBe(false)
      seen.add(text)
      await nextCard(page)
    }
    await page.screenshot({ path: testInfo.outputPath('02-card.png'), fullPage: true })
  })

  test('answer out loud: timer, pause with Space, done goes to the next card', async ({ page }, testInfo) => {
    await page.goto('/play/general')
    await skipToCore(page)
    const text = await question(page).innerText()

    await page.getByRole('button', { name: /Answer out loud/ }).click()
    await expect(status(page)).toHaveText(/Speak now/)
    await expect(question(page)).toHaveText(text)
    await expect(page.getByRole('timer')).toHaveText(/^(2:00|1:5\d)$/)
    await page.screenshot({ path: testInfo.outputPath('03-answering.png'), fullPage: true })

    await page.keyboard.press('Space')
    await expect(status(page)).toHaveText(/Paused/)
    await page.keyboard.press('Space')
    await expect(status(page)).toHaveText(/Speak now/)

    await page.getByRole('button', { name: 'I\'m done' }).click()
    await expect(counter(page, '2 of \\d+')).toBeVisible()
    await expect(question(page)).not.toHaveText(text)
  })

  test('the warm-up uses a 30 second timer', async ({ page }) => {
    await page.goto('/play/general')
    await expect(counter(page, 'Warm-up')).toBeVisible()
    await page.getByRole('button', { name: /Answer out loud/ }).click()
    await expect(page.getByRole('timer')).toHaveText(/^0:(30|29|28)$/)
  })

  test('keyboard: → next card, Space starts the timer', async ({ page }) => {
    await page.goto('/play/general')
    await expect(counter(page, 'Warm-up')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(counter(page, 'Intro')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(status(page)).toHaveText(/Speak now/)
  })

  test('a refresh keeps the same card', async ({ page }) => {
    await page.goto('/play/general')
    await skipToCore(page)
    await nextCard(page)
    await expect(counter(page, '2 of \\d+')).toBeVisible()
    const text = await question(page).innerText()
    await page.reload()
    await expect(counter(page, '2 of \\d+')).toBeVisible()
    await expect(question(page)).toHaveText(text)
  })

  test('specific decks are Premium-only', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Behavioral/ })).toHaveCount(0)
    await page.goto('/play/behavioral')
    await expect(page.getByText('This deck does not exist.')).toBeVisible()
  })

  test('there is no mock interview on the free level', async ({ page }) => {
    const response = await page.goto('/mock/general')
    expect(response?.status()).toBe(404)
  })

  test('unknown deck shows a way back', async ({ page }) => {
    await page.goto('/play/does-not-exist')
    await expect(page.getByText('This deck does not exist.')).toBeVisible()
  })
})

test.describe('premium', () => {
  test('premium pages mount the same screens with hints', async ({ page }, testInfo) => {
    await page.goto('/premium')
    await expect(page.getByText('Premium', { exact: true })).toBeVisible()
    await expect(page.locator('a[href*="skool.com"]:visible')).toHaveAttribute('href', 'https://www.skool.com/test')

    await page.getByRole('button', { name: 'Shuffle & draw' }).click()
    await expect(page).toHaveURL(/\/premium\/play\/general$/)
    await expect(counter(page, 'Warm-up')).toBeVisible()
    await expect(page.getByRole('complementary')).toContainText('Hint')
    await nextCard(page)
    await expect(page.getByRole('complementary')).toContainText('Hint')

    // Most General cards (from the ebook) have an example answer: find one, closed until opened.
    const example = page.getByText('See an example answer')
    await nextCard(page)
    for (let i = 0; i < 10 && !(await example.isVisible()); i++) await nextCard(page)
    await expect(example).toBeVisible()
    await expect(page.getByText(/Use it as a model, not a script/)).toBeHidden()
    await example.click()
    await expect(page.getByText(/Use it as a model, not a script/)).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('05-premium-card.png'), fullPage: true })

    await page.getByRole('link', { name: 'Back to the deck' }).click()
    await expect(page).toHaveURL(/\/premium$/)
  })

  test('mock interview: warm-up, intro, 4 questions, one follow-up, wrap-up, then the end', async ({ page }, testInfo) => {
    await page.goto('/premium')
    await page.getByRole('radio', { name: 'Mock interview' }).click()
    await page.screenshot({ path: testInfo.outputPath('04-premium-home-mock.png'), fullPage: true })
    await page.getByRole('button', { name: 'Start mock interview' }).click()
    await expect(page).toHaveURL(/\/premium\/mock\/general$/)

    await skipToCore(page)
    for (const step of ['2 of 4', '3 of 4', '4 of 4']) {
      await nextCard(page)
      await expect(counter(page, step)).toBeVisible()
    }
    await page.getByRole('button', { name: 'Next card' }).click()
    await expect(counter(page, 'Follow-up')).toBeVisible()
    await page.getByRole('button', { name: 'Next card' }).click()
    await expect(counter(page, 'Wrap-up')).toBeVisible()
    await page.getByRole('button', { name: 'Next card' }).click()
    await expect(page.getByRole('heading', { name: 'That\'s the interview.' })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('06-mock-complete.png'), fullPage: true })

    await page.getByRole('button', { name: 'Start another mock interview' }).click()
    await expect(counter(page, 'Warm-up')).toBeVisible()
  })

  test('only premium pages download the hints file', async ({ page }) => {
    const downloaded: string[] = []
    page.on('response', async (response) => {
      if (/\.(js|json|html)(\?|$)/.test(response.url())) downloaded.push(await response.text().catch(() => ''))
    })
    const hintText = 'Keep it short and warm'
    const exampleText = 'grew from 5,000 to 50,000 users'

    await page.goto('/play/general')
    await expect(counter(page, 'Warm-up')).toBeVisible()
    await nextCard(page)
    await expect(page.getByRole('complementary')).toHaveCount(0)
    expect(downloaded.join('\n')).not.toContain(hintText)
    expect(downloaded.join('\n')).not.toContain(exampleText)

    // Control: the same capture does see the hints on a premium page.
    await page.goto('/premium/play/general')
    await expect(page.getByRole('complementary')).toContainText('Hint')
    await expect.poll(() => downloaded.join('\n')).toContain(hintText)
    expect(downloaded.join('\n')).toContain(exampleText)
  })
})
