/** Short form of a URL to show as text: no protocol, no "www.", only the first path segment. */
export function shortUrl(url: string): string {
  const { hostname, pathname } = new URL(url)
  const first = pathname.split('/').find(Boolean)
  return hostname.replace(/^www\./, '') + (first ? `/${first}` : '')
}
