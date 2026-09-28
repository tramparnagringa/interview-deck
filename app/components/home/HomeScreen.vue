<template>
  <main
    class="home-screen"
    :style="deckAccentStyle(selected?.color)"
  >
    <AppHeader />
    <UiSegmented
      v-if="modeOptions.length > 1"
      v-model="mode"
      :label="copy.home.mode"
      :options="modeOptions"
    />
    <DeckPicker
      v-model="selectedSlug"
      :decks="decks"
    />
    <DeckStack
      :drawing="drawing"
      @draw="draw(false)"
    />
    <p
      v-if="mode === 'mock'"
      class="home-screen-mode-note"
    >
      {{ copy.home.mockDescription }}
    </p>
    <UiButton
      :icon="mode === 'mock' ? 'lucide:play' : 'lucide:shuffle'"
      block
      @click="draw(true)"
    >
      {{ mode === 'mock' ? copy.home.startMock : copy.home.shuffle }}
    </UiButton>
    <CtaSkool context="home" />
  </main>
</template>

<script setup lang="ts">
/** Home (screens 01 and 04). Mounted by `/` and `/premium`; Premium also chooses the mode. */
import data from '#build/decks'
import { isDeckAvailable, type Mode } from '#shared/schemas/deck'
import { copy } from '~/content/copy'
import { deckAccentStyle } from '~/utils/deck'

const DRAW_ANIMATION_MS = 300
const { features, basePath, level } = useLevel()
const decks = computed(() => data.decks.filter(deck => isDeckAvailable(level.value, deck.slug)))

const selectedSlug = useState('selected-deck', () => decks.value[0]?.slug ?? 'general')
const selected = computed(() => decks.value.find(deck => deck.slug === selectedSlug.value) ?? decks.value[0])
watch(selected, (deck) => {
  if (deck && deck.slug !== selectedSlug.value) selectedSlug.value = deck.slug
}, { immediate: true })

const modeOptions = computed(() => features.value.modes.map(value => ({ value, label: copy.home.modes[value] })))
const chosenMode = useState<Mode>('practice-mode', () => 'practice')
/** Falls back to practice on levels without the chosen mode. */
const mode = computed<Mode>({
  get: () => (features.value.modes.includes(chosenMode.value) ? chosenMode.value : 'practice'),
  set: (value) => {
    chosenMode.value = value
  },
})

const drawing = ref(false)

async function draw(shuffle: boolean) {
  if (!selected.value || drawing.value) return
  drawing.value = true
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reducedMotion) await new Promise(resolve => setTimeout(resolve, DRAW_ANIMATION_MS))
  const route = mode.value === 'mock' ? 'mock' : 'play'
  await navigateTo({ path: `${basePath.value}/${route}/${selected.value.slug}`, query: shuffle ? { shuffle: '1' } : {} })
}
</script>

<style scoped>
.home-screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-5);
}

.home-screen-mode-note {
  margin: 0;
  color: var(--color-ink-muted);
  text-align: center;
}
</style>
