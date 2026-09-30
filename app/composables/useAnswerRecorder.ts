import { coverFit, mix, pickRecordingMimeType, recordingExtension, withAlpha, wrapText } from '~/utils/recording'

export type RecorderStatus = 'idle' | 'starting' | 'recording' | 'recorded' | 'error'

/** Portrait video, the format people post and watch on their phones. */
const WIDTH = 720
const HEIGHT = 1280
const FPS = 30
const MARGIN = 48
/** The brand at the bottom: the logo's height. */
const FOOTER_HEIGHT = 64

interface Frame {
  category: string
  question: string
  brand: { product: string, by: string }
}

interface Box { x: number, y: number, width: number, height: number }

type Tokens = ReturnType<typeof readTokens>

/** Design tokens read from CSS, so the video uses the app's colors and font. */
function readTokens() {
  const style = getComputedStyle(document.documentElement)
  // The build minifies colors (#FFFFFF → #fff); a canvas hands any color back as #rrggbb.
  const probe = document.createElement('canvas').getContext('2d')!
  const color = (value: string) => {
    probe.fillStyle = '#000000'
    probe.fillStyle = value
    return String(probe.fillStyle)
  }
  const raw = (name: string) => style.getPropertyValue(name).trim()
  const token = (name: string) => color(raw(name))
  return {
    surface: token('--color-surface'),
    border: token('--color-border'),
    ink: token('--color-ink'),
    accent: token(raw('--deck-accent') ? '--deck-accent' : '--color-accent'),
    brandBg: token('--color-tng-disc'),
    brandRing: token('--color-tng-ring'),
    brandArrow: token('--color-tng-arrow'),
    brandArrowSoft: token('--color-tng-arrow-soft'),
    brandInk: token('--color-tng-ink'),
    shade: token('--color-tng-shade'),
    font: raw('--font-sans'),
  }
}

/** The Trampar na Gringa mark (same shapes as AppTngMark.vue, on a 200×200 grid). */
function drawTngMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, tokens: Tokens) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 200, size / 200)
  ctx.fillStyle = tokens.brandBg
  ctx.beginPath()
  ctx.arc(100, 100, 92, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = tokens.brandRing
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(100, 100, 78, 0, Math.PI * 2)
  ctx.stroke()
  ctx.translate(100, 100)
  ctx.rotate(Math.PI / 12)
  ctx.translate(-100, -100)
  const triangle = (points: [number, number][], color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    points.forEach(([px, py], index) => index ? ctx.lineTo(px, py) : ctx.moveTo(px, py))
    ctx.closePath()
    ctx.fill()
  }
  triangle([[100, 48], [134, 100], [66, 100]], tokens.brandArrow)
  triangle([[66, 100], [134, 100], [100, 152]], tokens.brandArrowSoft)
  ctx.restore()
}

function createLayer() {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  return { canvas, ctx: canvas.getContext('2d')! }
}

/** Bottom, on the background: the brand, centered. */
function drawFooter(ctx: CanvasRenderingContext2D, frame: Frame, tokens: Tokens, top: number) {
  const logo = FOOTER_HEIGHT
  const gap = 20
  ctx.font = `700 40px ${tokens.font}`
  const productWidth = ctx.measureText(frame.brand.product).width
  ctx.font = `500 24px ${tokens.font}`
  const byWidth = ctx.measureText(frame.brand.by).width
  const x = (WIDTH - (logo + gap + Math.max(productWidth, byWidth))) / 2

  ctx.fillStyle = withAlpha(tokens.brandInk, 0.2)
  ctx.beginPath()
  ctx.arc(x + logo / 2, top + logo / 2, logo / 2 + 4, 0, Math.PI * 2)
  ctx.fill()
  drawTngMark(ctx, x, top, logo, tokens)
  ctx.fillStyle = tokens.brandInk
  ctx.font = `700 40px ${tokens.font}`
  ctx.fillText(frame.brand.product, x + logo + gap, top + 32)
  ctx.fillStyle = withAlpha(tokens.brandInk, 0.75)
  ctx.font = `500 24px ${tokens.font}`
  ctx.fillText(frame.brand.by, x + logo + gap, top + 64)
}

/** The playing card: a cream edge around the camera, on top of a tilted card of the deck. Returns where the camera goes. */
function drawCard(ctx: CanvasRenderingContext2D, tokens: Tokens, card: Box): Box {
  const radius = 36
  const edge = 14

  ctx.save()
  ctx.translate(card.x + card.width / 2, card.y + card.height / 2)
  ctx.rotate(-Math.PI / 60)
  ctx.fillStyle = withAlpha(tokens.brandInk, 0.18)
  ctx.beginPath()
  ctx.roundRect(-card.width / 2, -card.height / 2, card.width, card.height, radius)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = tokens.surface
  ctx.beginPath()
  ctx.roundRect(card.x, card.y, card.width, card.height, radius)
  ctx.fill()

  return { x: card.x + edge, y: card.y + edge, width: card.width - edge * 2, height: card.height - edge * 2 }
}

/**
 * Over the camera, at the bottom like subtitles (the face is usually at the top): the category
 * chip and the question, on a near-black gradient so white text reads on any background.
 * The brand mark sits in the top corner, like the suit of a card.
 */
function drawCaption(ctx: CanvasRenderingContext2D, frame: Frame, tokens: Tokens, video: Box) {
  const padding = 28
  drawTngMark(ctx, video.x + video.width - padding - 44, video.y + padding, 44, tokens)

  ctx.font = `600 40px ${tokens.font}`
  const lines = wrapText(frame.question, video.width - padding * 2, text => ctx.measureText(text).width)
  const lineHeight = 50
  const chip = 44
  const textHeight = chip + 20 + lines.length * lineHeight
  const bottom = video.y + video.height - padding
  const top = bottom - textHeight

  const scrimTop = top - 120
  const scrim = ctx.createLinearGradient(0, scrimTop, 0, video.y + video.height)
  scrim.addColorStop(0, withAlpha(tokens.shade, 0))
  scrim.addColorStop(0.45, withAlpha(tokens.shade, 0.7))
  scrim.addColorStop(1, withAlpha(tokens.shade, 0.92))
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(video.x, video.y, video.width, video.height, 24)
  ctx.clip()
  ctx.fillStyle = scrim
  ctx.fillRect(video.x, scrimTop, video.width, video.y + video.height - scrimTop)
  ctx.restore()

  // Category chip, like the deck chip in the app
  ctx.font = `600 22px ${tokens.font}`
  const chipWidth = 20 + 12 + 10 + ctx.measureText(frame.category).width + 20
  ctx.fillStyle = tokens.surface
  ctx.beginPath()
  ctx.roundRect(video.x + padding, top, chipWidth, chip, chip / 2)
  ctx.fill()
  ctx.fillStyle = tokens.accent
  ctx.beginPath()
  ctx.arc(video.x + padding + 26, top + chip / 2, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = tokens.ink
  ctx.textBaseline = 'middle'
  ctx.fillText(frame.category, video.x + padding + 42, top + chip / 2 + 1)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = tokens.brandInk
  ctx.font = `600 40px ${tokens.font}`
  lines.forEach((line, index) => ctx.fillText(line, video.x + padding, top + chip + 20 + 38 + index * lineHeight))
}

/**
 * The background: the brand purple, darkened toward the shade, with a soft light at the top and
 * getting darker toward the bottom.
 */
function drawBackdrop(ctx: CanvasRenderingContext2D, tokens: Tokens) {
  const base = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  base.addColorStop(0, mix(tokens.brandBg, tokens.shade, 0.35))
  base.addColorStop(0.55, mix(tokens.brandBg, tokens.shade, 0.55))
  base.addColorStop(1, mix(tokens.brandBg, tokens.shade, 0.8))
  ctx.fillStyle = base
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glow = ctx.createRadialGradient(WIDTH * 0.2, HEIGHT * 0.08, 0, WIDTH * 0.2, HEIGHT * 0.08, WIDTH * 1.1)
  glow.addColorStop(0, withAlpha(tokens.brandInk, 0.12))
  glow.addColorStop(1, withAlpha(tokens.brandInk, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

/**
 * The parts that don't move, drawn once: what goes under the camera (brand background, card,
 * footer) and what goes over it (the question). Each frame stacks them around the camera.
 */
function drawLayers(frame: Frame, tokens: Tokens) {
  const under = createLayer()
  drawBackdrop(under.ctx, tokens)
  const footerTop = HEIGHT - MARGIN - FOOTER_HEIGHT
  drawFooter(under.ctx, frame, tokens, footerTop)
  const video = drawCard(under.ctx, tokens, { x: MARGIN, y: MARGIN, width: WIDTH - MARGIN * 2, height: footerTop - 40 - MARGIN })

  const over = createLayer()
  drawCaption(over.ctx, frame, tokens, video)
  return { under: under.canvas, over: over.canvas, video }
}

/**
 * Records the camera while the candidate answers, composed into one video on the brand purple:
 * a playing card filled by the candidate with the question over it, and the brand at the bottom.
 * Everything stays in the browser; nothing is uploaded. `save` opens the share sheet
 * (iOS: "Save Video") or downloads the file.
 */
export function useAnswerRecorder() {
  const status = ref<RecorderStatus>('idle')
  const videoUrl = ref<string | null>(null)
  const preview = shallowRef<MediaStream | null>(null)

  let camera: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let frameRequest = 0
  let file: File | null = null

  function drawFrame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, layers: ReturnType<typeof drawLayers>) {
    ctx.drawImage(layers.under, 0, 0)
    const box = layers.video
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(box.x, box.y, box.width, box.height, 24)
    ctx.clip()
    if (video.videoWidth) {
      const fit = coverFit({ width: video.videoWidth, height: video.videoHeight }, box)
      // Not mirrored (only the live preview is): the video shows the real orientation, like a post.
      ctx.drawImage(video, box.x + fit.x, box.y + fit.y, fit.width, fit.height)
    }
    ctx.restore()
    ctx.drawImage(layers.over, 0, 0)
  }

  async function start(frame: Frame) {
    if (status.value === 'starting' || status.value === 'recording') return
    discard()
    status.value = 'starting'
    const mimeType = typeof MediaRecorder === 'undefined' ? null : pickRecordingMimeType(type => MediaRecorder.isTypeSupported(type))
    if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
      status.value = 'error'
      return
    }
    try {
      camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
    }
    catch {
      status.value = 'error'
      return
    }
    preview.value = camera

    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.srcObject = camera
    await video.play().catch(() => undefined)

    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext('2d')!
    await document.fonts?.ready
    const layers = drawLayers(frame, readTokens())
    const loop = () => {
      drawFrame(ctx, video, layers)
      frameRequest = requestAnimationFrame(loop)
    }
    loop()

    const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...camera.getAudioTracks()])
    const chunks: Blob[] = []
    recorder = new MediaRecorder(stream, { mimeType })
    recorder.ondataavailable = event => event.data.size && chunks.push(event.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      file = new File([blob], `interview-answer.${recordingExtension(mimeType)}`, { type: mimeType })
      videoUrl.value = URL.createObjectURL(blob)
      status.value = 'recorded'
    }
    recorder.start()
    status.value = 'recording'
  }

  function release() {
    cancelAnimationFrame(frameRequest)
    camera?.getTracks().forEach(track => track.stop())
    camera = null
    preview.value = null
  }

  function stop() {
    if (recorder?.state === 'recording') recorder.stop()
    recorder = null
    release()
  }

  function discard() {
    stop()
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
    file = null
    status.value = 'idle'
  }

  async function save() {
    if (!file) return
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      }
      catch {
        // Share sheet closed by the user: nothing else to do.
        return
      }
    }
    const link = document.createElement('a')
    link.href = videoUrl.value!
    link.download = file.name
    link.click()
  }

  onScopeDispose(() => {
    if (recorder?.state === 'recording') recorder.onstop = null
    stop()
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  })

  return { status: readonly(status), videoUrl: readonly(videoUrl), preview, start, stop, discard, save }
}
