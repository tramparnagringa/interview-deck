/** Video formats to try, best first: MP4 plays and saves everywhere (iOS gallery); WebM is the fallback. */
const MIME_TYPES = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'] as const

export function pickRecordingMimeType(isSupported: (type: string) => boolean): string | null {
  return MIME_TYPES.find(type => isSupported(type)) ?? null
}

export function recordingExtension(mimeType: string): 'mp4' | 'webm' {
  return mimeType.startsWith('video/mp4') ? 'mp4' : 'webm'
}

/** Splits text into lines that fit `maxWidth`, measured with `measure` (a canvas `measureText`). */
export function wrapText(text: string, maxWidth: number, measure: (text: string) => number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word
    if (line && measure(candidate) > maxWidth) {
      lines.push(line)
      line = word
    }
    else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Scale and offset to cover a `box` with a `source`, like CSS `object-fit: cover`. */
export function coverFit(source: { width: number, height: number }, box: { width: number, height: number }) {
  const scale = Math.max(box.width / source.width, box.height / source.height)
  const width = source.width * scale
  const height = source.height * scale
  return { x: (box.width - width) / 2, y: (box.height - height) / 2, width, height }
}

/** A `#rrggbb` color with an alpha, for canvas gradients (which can't mix a CSS var with opacity). */
export function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgb(${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255} / ${alpha})`
}

/** Blends two `#rrggbb` colors: `amount` 0 is `a`, 1 is `b`. */
export function mix(a: string, b: string, amount: number): string {
  const channels = (hex: string) => {
    const value = Number.parseInt(hex.replace('#', ''), 16)
    return [value >> 16, value >> 8, value].map(channel => channel & 255)
  }
  const [from, to] = [channels(a), channels(b)]
  return `#${from.map((channel, index) => Math.round(channel + (to[index]! - channel) * amount).toString(16).padStart(2, '0')).join('')}`
}
