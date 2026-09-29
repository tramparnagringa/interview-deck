<template>
  <div class="card-timer">
    <UiButton
      :icon="icon"
      icon-tone="accent"
      :aria-label="actionLabel"
      block
      @click="toggle"
    >
      <span class="card-timer-label">
        <span
          v-if="!countdown.active.value && timer.status.value !== 'idle'"
          role="timer"
          :aria-label="copy.card.timer.remaining(time)"
          class="card-timer-time"
        >{{ time }}</span>
        <span class="card-timer-status">{{ statusText }}</span>
      </span>
    </UiButton>
    <UiVisuallyHidden
      tag="p"
      role="status"
      aria-live="polite"
    >
      {{ statusText }}
    </UiVisuallyHidden>
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
import { formatDuration } from '~/utils/deck'

/**
 * Answer timer on the card: waits for `ready` (the question audio is over), counts 3, 2, 1 and
 * starts. Tapping (or `Space`) pauses and resumes; when time is up it stays on the card.
 * Mounted once per card, so a new card always starts from the full duration.
 */
const props = defineProps<{ durationSeconds: number, ready: boolean }>()

const countdown = useCountdown()
const timer = useTimer(props.durationSeconds)
const time = computed(() => formatDuration(timer.remainingSeconds.value))

const statusText = computed(() => {
  if (countdown.active.value) return copy.card.timer.startingIn(countdown.remaining.value)
  if (timer.status.value === 'idle') return copy.card.timer.waiting
  if (timer.status.value === 'paused') return copy.card.timer.paused
  if (timer.status.value === 'done') return copy.card.timer.timeUp
  return copy.card.timer.speakNow
})

const icon = computed(() => {
  if (timer.status.value === 'running') return 'lucide:pause'
  if (timer.status.value === 'done') return 'lucide:rotate-ccw'
  if (timer.status.value === 'paused') return 'lucide:play'
  return 'lucide:timer'
})

const actionLabel = computed(() => {
  if (timer.status.value === 'running') return copy.card.timer.pause
  if (timer.status.value === 'paused') return copy.card.timer.resume
  if (timer.status.value === 'done') return copy.card.timer.restart
  return copy.card.timer.startNow
})

function startNow() {
  countdown.cancel()
  timer.start()
}

/** Pause / resume; before it starts, start right away; after time is up, start again. */
function toggle() {
  if (timer.status.value === 'idle' || timer.status.value === 'done') startNow()
  else timer.toggle()
}

watch(() => props.ready, (ready) => {
  if (ready && timer.status.value === 'idle' && !countdown.active.value) countdown.start(timer.start)
}, { immediate: true })

defineExpose({ toggle })
</script>

<style scoped>
.card-timer {
  display: flex;
  flex: 1;
  min-width: 0;
}

.card-timer-label {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
}

.card-timer-time {
  font-variant-numeric: tabular-nums;
}

.card-timer-status {
  font-weight: var(--font-weight-medium);
}
</style>
