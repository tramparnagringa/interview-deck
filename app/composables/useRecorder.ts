export type RecorderError = 'denied' | 'unsupported' | 'failed'

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type))
}

export function extensionFor(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

/** Records the microphone into a Blob, in memory only. */
export function useRecorder() {
  const recording = ref(false)
  const error = ref<RecorderError | null>(null)

  let recorder: MediaRecorder | undefined
  let stream: MediaStream | undefined
  let chunks: Blob[] = []

  function releaseStream() {
    stream?.getTracks().forEach(track => track.stop())
    stream = undefined
  }

  async function start(): Promise<boolean> {
    error.value = null
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      error.value = 'unsupported'
      return false
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    }
    catch (cause) {
      error.value = cause instanceof DOMException && cause.name === 'NotAllowedError' ? 'denied' : 'failed'
      return false
    }
    const mimeType = pickMimeType()
    chunks = []
    recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined)
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    })
    recorder.start(1000)
    recording.value = true
    return true
  }

  function pause() {
    if (recorder?.state === 'recording') recorder.pause()
  }

  function resume() {
    if (recorder?.state === 'paused') recorder.resume()
  }

  /** Stops and returns the recording, or null when nothing was recorded. */
  function stop(): Promise<Blob | null> {
    const current = recorder
    if (!current || current.state === 'inactive') {
      releaseStream()
      return Promise.resolve(null)
    }
    return new Promise((resolve) => {
      current.addEventListener('stop', () => {
        const blob = chunks.length ? new Blob(chunks, { type: current.mimeType || 'audio/webm' }) : null
        chunks = []
        recorder = undefined
        recording.value = false
        releaseStream()
        resolve(blob)
      }, { once: true })
      current.stop()
    })
  }

  /** Stops and throws the recording away. */
  async function cancel() {
    await stop()
  }

  onScopeDispose(() => {
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    releaseStream()
  })

  return { recording: readonly(recording), error: readonly(error), start, pause, resume, stop, cancel }
}
