<template>
  <div class="answer-focus">
    <CardTopBar
      :close-label="copy.answer.close"
      tone="dark"
      @close="cancel"
    >
      <UiStatus
        :tone="statusTone"
        :pulse="timer.status.value === 'running'"
        inverse
      >
        {{ statusText }}
      </UiStatus>
    </CardTopBar>

    <AnswerQuestion
      :meta="meta"
      :question="question"
    />

    <p
      v-if="micNotice"
      class="answer-focus-notice"
      role="alert"
    >
      {{ copy.answer.micDenied }}
    </p>

    <div class="answer-focus-ring">
      <UiProgressRing :progress="timer.progress.value">
        <span
          class="answer-focus-time"
          role="timer"
          :aria-label="copy.answer.remaining(time)"
        >{{ time }}</span>
        <UiOverline
          tone="inverse"
          tag="span"
        >
          {{ copy.answer.ringLabel }}
        </UiOverline>
      </UiProgressRing>
    </div>

    <div class="answer-focus-controls">
      <UiIconButton
        :icon="timer.status.value === 'paused' ? 'lucide:play' : 'lucide:pause'"
        :label="timer.status.value === 'paused' ? copy.answer.resume : copy.answer.pause"
        tone="dark"
        size="lg"
        @click="toggle"
      />
      <UiButton
        variant="inverse"
        block
        :loading="finishing"
        @click="finish"
      >
        {{ copy.answer.done }}
      </UiButton>
      <UiIconButton
        icon="lucide:rotate-ccw"
        :label="copy.answer.restart"
        tone="dark"
        size="lg"
        @click="restart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
import { formatDuration } from '~/utils/deck'

/** Screen 03: countdown, optional recording, pause / done / restart. */
const props = defineProps<{
  question: string
  meta: string
  /** Record the answer for AI feedback. */
  record: boolean
}>()

const emit = defineEmits<{
  finish: [audio: Blob | null]
  cancel: []
}>()

const TIME_UP_DELAY_MS = 1200

const timer = useTimer()
const recorder = useRecorder()
const finishing = ref(false)
const micNotice = computed(() => props.record && recorder.error.value !== null)

const time = computed(() => formatDuration(timer.remainingSeconds.value))
const statusText = computed(() => {
  if (timer.status.value === 'paused') return copy.answer.paused
  if (timer.status.value === 'done') return copy.answer.timeUp
  return copy.answer.speakNow
})
const statusTone = computed(() => (timer.status.value === 'running' ? 'accent' : 'muted'))

async function begin() {
  if (props.record) await recorder.start()
  timer.start()
}

function toggle() {
  if (timer.status.value === 'running') {
    timer.pause()
    recorder.pause()
  }
  else if (timer.status.value === 'paused') {
    timer.resume()
    recorder.resume()
  }
}

async function restart() {
  await recorder.cancel()
  timer.reset()
  await begin()
}

async function finish() {
  if (finishing.value) return
  finishing.value = true
  timer.pause()
  const audio = await recorder.stop()
  emit('finish', audio)
}

async function cancel() {
  timer.reset()
  await recorder.cancel()
  emit('cancel')
}

let timeUpTimeout: ReturnType<typeof setTimeout> | undefined
watch(() => timer.status.value, (status) => {
  if (status === 'done') timeUpTimeout = setTimeout(finish, TIME_UP_DELAY_MS)
})

useKeyboardShortcuts({ onToggle: toggle })

onMounted(begin)
onBeforeUnmount(() => clearTimeout(timeUpTimeout))
</script>

<style scoped>
.answer-focus {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-6);
}

.answer-focus-notice {
  margin: 0;
  color: var(--color-focus-ink-muted);
  font-size: var(--text-sm);
  text-align: center;
}

.answer-focus-ring {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.answer-focus-time {
  font-size: var(--text-display);
  font-weight: var(--font-weight-medium);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.answer-focus-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
