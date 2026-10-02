/**
 * Browsers built into apps (LinkedIn, Instagram, Facebook…). Google refuses to sign in there
 * (`disallowed_useragent`), so the login page asks to open the link in the phone's browser.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return /LinkedInApp|Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|TikTok|Snapchat|; wv\)/i.test(userAgent)
}
