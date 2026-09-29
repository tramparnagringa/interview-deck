import { coverFit, pickRecordingMimeType, recordingExtension, wrapText } from '~/utils/recording'

export type RecorderStatus = 'idle' | 'starting' | 'recording' | 'recorded' | 'error'

/** Portrait video, the format people post and watch on their phones. */
const WIDTH = 720
const HEIGHT = 1280
const FPS = 30

interface Frame {
  category: string
  question: string
  brand: string
}

/** Design tokens read from CSS, so the video uses the app's colors and font. */
function readTokens() {
  const style = getComputedStyle(document.documentElement)
  const token = (name: string) => style.getPropertyValue(name).trim()
  return {
    bg: token('--color-bg'),
    surface: token('--color-surface'),
    border: token('--color-border'),
    ink: token('--color-ink'),
    muted: token('--color-ink-muted'),
    accent: token('--deck-accent') || token('--color-accent'),
    font: token('--font-sans'),
  }
}

/**
 * Records the camera while the candidate answers, composed into one video: the question card on
 * top, the candidate below and the brand at the bottom. Everything stays in the browser; nothing
 * is uploaded. `save` opens the share sheet (iOS: "Save Video") or downloads the file.
 */
export function useAnswerRecorder() {
  const status = ref<RecorderStatus>('idle')
  const videoUrl = ref<string | null>(null)
  const preview = shallowRef<MediaStream | null>(null)

  let camera: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let frameRequest = 0
  let file: File | null = null

  function drawFrame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, frame: Frame, tokens: ReturnType<typeof readTokens>) {
    const margin = 48
    const inner = WIDTH - margin * 2
    ctx.fillStyle = tokens.bg
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Question card
    ctx.font = `600 44px ${tokens.font}`
    const lines = wrapText(frame.question, inner - 64, text => ctx.measureText(text).width)
    const cardHeight = 32 + 40 + 24 + lines.length * 54 + 32
    ctx.fillStyle = tokens.surface
    ctx.strokeStyle = tokens.border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(margin, margin, inner, cardHeight, 32)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = tokens.accent
    ctx.beginPath()
    ctx.arc(margin + 40, margin + 52, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = tokens.ink
    ctx.font = `600 26px ${tokens.font}`
    ctx.textBaseline = 'middle'
    ctx.fillText(frame.category, margin + 60, margin + 52)
    ctx.font = `600 44px ${tokens.font}`
    ctx.textBaseline = 'alphabetic'
    lines.forEach((line, index) => ctx.fillText(line, margin + 32, margin + 32 + 40 + 24 + 44 + index * 54))

    // Candidate
    const top = margin + cardHeight + 32
    const bottom = HEIGHT - margin - 56
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(margin, top, inner, bottom - top, 32)
    ctx.clip()
    if (video.videoWidth) {
      const fit = coverFit({ width: video.videoWidth, height: video.videoHeight }, { width: inner, height: bottom - top })
      // Not mirrored (only the live preview is): the video shows the real orientation, like a post.
      ctx.drawImage(video, margin + fit.x, top + fit.y, fit.width, fit.height)
    }
    ctx.restore()

    // Brand
    ctx.fillStyle = tokens.muted
    ctx.font = `500 24px ${tokens.font}`
    ctx.textAlign = 'center'
    ctx.fillText(frame.brand, WIDTH / 2, HEIGHT - margin)
    ctx.textAlign = 'start'
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
    const tokens = readTokens()
    const loop = () => {
      drawFrame(ctx, video, frame, tokens)
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
