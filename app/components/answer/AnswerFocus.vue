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
        @click="timer.toggle"
      />
      <UiButton
        variant="inverse"
        block
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
import { DEFAULT_ANSWER_SECONDS } from '~/composables/useTimer'

/** Screen 03: countdown with pause / done / restart. `Space` pauses and resumes. */
const props = withDefaults(defineProps<{
  question: string
  meta: string
  durationSeconds?: number
}>(), {
  durationSeconds: DEFAULT_ANSWER_SECONDS,
})

const emit = defineEmits<{
  finish: []
  cancel: []
}>()

const TIME_UP_DELAY_MS = 1200

const timer = useTimer(props.durationSeconds)
let finished = false

const time = computed(() => formatDuration(timer.remainingSeconds.value))
const statusText = computed(() => {
  if (timer.status.value === 'paused') return copy.answer.paused
  if (timer.status.value === 'done') return copy.answer.timeUp
  return copy.answer.speakNow
})
const statusTone = computed(() => (timer.status.value === 'running' ? 'accent' : 'muted'))

function restart() {
  timer.reset()
  timer.start()
}

function finish() {
  if (finished) return
  finished = true
  timer.pause()
  emit('finish')
}

function cancel() {
  timer.reset()
  emit('cancel')
}

let timeUpTimeout: ReturnType<typeof setTimeout> | undefined
watch(() => timer.status.value, (status) => {
  if (status === 'done') timeUpTimeout = setTimeout(finish, TIME_UP_DELAY_MS)
})

useKeyboardShortcuts({ onToggle: timer.toggle })

onMounted(timer.start)
onBeforeUnmount(() => clearTimeout(timeUpTimeout))
</script>

<style scoped>
.answer-focus {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-6);
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
