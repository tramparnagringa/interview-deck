<template>
  <main
    class="play-screen"
    :style="deckAccentStyle(practice.deck?.color)"
  >
    <AnswerFocus
      v-if="answering && card"
      :key="answerCount"
      :question="card.question"
      :meta="`${card.category} · ${progress}`"
      :duration-seconds="duration"
      @finish="finishAnswer"
      @cancel="answering = false"
    />

    <template v-else>
      <CardTopBar
        :close-label="copy.card.close"
        :close-to="basePath || '/'"
      >
        <p
          v-if="card && !practice.finished"
          class="play-screen-counter"
        >
          {{ progress }}
        </p>
      </CardTopBar>

      <AppNotice
        v-if="notFound"
        :message="copy.card.notFound"
        :action-label="copy.errors.home"
        action-to="/"
      />

      <PlayMockComplete
        v-else-if="practice.finished"
        :answered="practice.order.length"
        :home-to="basePath || '/'"
        @again="practice.startSession"
      />

      <template v-else>
        <div
          ref="swipeArea"
          class="play-screen-swipe"
          :class="{ 'play-screen-swipe-dragging': dragging }"
          :style="{ '--play-screen-drag': `${offset}px`, '--play-screen-tilt': tilt }"
        >
          <Transition
            :name="direction === 'back' ? 'play-screen-card-back' : 'play-screen-card'"
            mode="out-in"
          >
            <div
              :key="card?.id ?? 'empty'"
              class="play-screen-card"
            >
              <CardFace
                v-if="card"
                :card="cardWithPremium ?? card"
              />
            </div>
          </Transition>
        </div>
        <CardActions
          :duration="formatDuration(duration)"
          @answer="startAnswer"
          @next="goNext"
        />
      </template>

      <CtaSkool context="card" />
    </template>
  </main>
</template>

<script setup lang="ts">
/**
 * Card, answering and next card (screens 02, 03 and 05). Mounted by `/play/:deck` and
 * `/premium/play/:deck` (practice) and by `/premium/mock/:deck` (mock interview).
 */
import { isDeckAvailable, type Mode, type PremiumContent } from '#shared/schemas/deck'
import { copy } from '~/content/copy'
import { deckAccentStyle, formatDuration } from '~/utils/deck'

const props = withDefaults(defineProps<{ mode?: Mode }>(), { mode: 'practice' })

const route = useRoute()
const practice = usePracticeStore()

const { features, basePath, level } = useLevel()
const card = computed(() => practice.currentCard)
/** "Warm-up", "Intro", "2 of 20", "Closing"… */
const progress = computed(() => {
  const stage = card.value?.stage
  if (!stage) return ''
  return stage === 'core' ? copy.card.counter(practice.questionNumber, practice.total) : copy.card.stages[stage]
})

// Premium content (hints, example answers) is a separate file, downloaded only on Premium pages.
const premium = shallowRef<Record<string, PremiumContent>>({})
const cardWithPremium = computed(() => {
  const extra = card.value && premium.value[card.value.id]
  return extra ? { ...card.value!, ...extra } : null
})
const duration = computed(() => card.value?.durationSeconds ?? DEFAULT_ANSWER_SECONDS)
const notFound = ref(false)
const answering = useFocusMode()
const answerCount = ref(0)

function startAnswer() {
  if (!card.value) return
  answerCount.value += 1
  answering.value = true
}

/** Which way the last card change went, so the card animation matches it. */
const direction = ref<'forward' | 'back'>('forward')

function goNext() {
  direction.value = 'forward'
  practice.next()
}

function goPrevious() {
  if (practice.position === 0) return false
  direction.value = 'back'
  practice.previous()
}

/** "I'm done" or time is up: next card (PRD screen 03). */
function finishAnswer() {
  answering.value = false
  goNext()
}

// Swipe left for the next card, right for the previous one (touch, mouse drag or trackpad).
const swipeArea = useTemplateRef<HTMLElement>('swipeArea')
const { offset, dragging } = useSwipe(swipeArea, { onLeft: goNext, onRight: goPrevious })
/** -1…1: how far the card is tilted while dragged, like a card pivoting on its bottom edge. */
const tilt = computed(() => Math.max(-1, Math.min(1, offset.value / (swipeArea.value?.offsetWidth || 1))))

// While answering, the answering screen owns the keyboard.
useKeyboardShortcuts({
  onToggle: () => {
    if (answering.value || practice.finished) return false
    startAnswer()
  },
  onNext: () => {
    if (answering.value || practice.finished) return false
    goNext()
  },
  onPrevious: () => {
    if (answering.value || practice.finished) return false
    return goPrevious()
  },
})

// The shuffled order lives in sessionStorage, so the deck is opened in the browser only.
onMounted(async () => {
  if (features.value.hints) {
    import('#build/premium').then((module) => {
      premium.value = module.default
    })
  }
  const slug = String(route.params.deck)
  notFound.value = !isDeckAvailable(level.value, slug)
    || !practice.openDeck(slug, { mode: props.mode, premium: features.value.hints, fresh: route.query.shuffle === '1' })
  if (route.query.shuffle) await navigateTo({ query: {} }, { replace: true })
})
</script>

<style scoped>
.play-screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-6);
}

.play-screen-counter {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
}

.play-screen-swipe {
  display: flex;
  flex: 1;
  flex-direction: column;
  touch-action: pan-y;
  transform:
    translateX(var(--play-screen-drag, 0))
    rotate(calc(var(--play-screen-tilt, 0) * var(--rotate-swipe-max)));
  transform-origin: center bottom;
  transition: transform var(--duration-card) var(--ease-card);
}

.play-screen-swipe-dragging {
  cursor: grabbing;
  transition: none;
  user-select: none;
}

.play-screen-card {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.play-screen-card-enter-active,
.play-screen-card-leave-active,
.play-screen-card-back-enter-active,
.play-screen-card-back-leave-active {
  transition:
    opacity var(--duration-card) var(--ease-card),
    transform var(--duration-card) var(--ease-card);
}

.play-screen-card-enter-from {
  opacity: 0;
  transform: translateY(var(--space-6)) scale(0.98);
}

.play-screen-card-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--space-12) * -1)) rotate(var(--rotate-stack-left));
}

.play-screen-card-back-enter-from {
  opacity: 0;
  transform: translateX(calc(var(--space-12) * -1)) rotate(var(--rotate-stack-left));
}

.play-screen-card-back-leave-to {
  opacity: 0;
  transform: translateX(var(--space-12)) rotate(var(--rotate-stack-right));
}

@media (prefers-reduced-motion: reduce) {
  .play-screen-swipe,
  .play-screen-card-enter-from,
  .play-screen-card-leave-to,
  .play-screen-card-back-enter-from,
  .play-screen-card-back-leave-to {
    transform: none;
  }
}
</style>
