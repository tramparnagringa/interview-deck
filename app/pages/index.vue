<template>
  <main
    class="home"
    :style="deckAccentStyle(selected?.color)"
  >
    <AppHeader />

    <AppNotice
      v-if="error"
      :message="copy.home.loadError"
      :action-label="copy.home.retry"
      @action="refresh()"
    />

    <template v-else>
      <DeckPicker
        v-model="selectedSlug"
        :decks="openDecks"
      />
      <DeckStack
        :drawing="drawing"
        :disabled="!selected"
        @draw="draw(false)"
      />
      <UiButton
        icon="lucide:shuffle"
        block
        :disabled="!selected"
        @click="draw(true)"
      >
        {{ copy.home.shuffle }}
      </UiButton>
      <HomeShortcuts
        v-if="isPremium"
        :deck-slug="selectedSlug"
      />
    </template>

    <CtaSkool context="home" />
  </main>
</template>

<script setup lang="ts">
import type { Deck } from '#shared/schemas/deck'
import { copy } from '~/content/copy'
import { deckAccentStyle } from '~/utils/deck'

const DRAW_ANIMATION_MS = 300

const { isPremium } = usePlan()
const { data: decks, error, refresh } = useFetch<Deck[]>('/api/decks', { key: 'decks', default: () => [] })

const openDecks = computed(() => decks.value.filter(deck => !deck.locked))
const selectedSlug = useState('selected-deck', () => 'general')
const selected = computed(() => openDecks.value.find(deck => deck.slug === selectedSlug.value) ?? openDecks.value[0])

watch(selected, (deck) => {
  if (deck && deck.slug !== selectedSlug.value) selectedSlug.value = deck.slug
}, { immediate: true })

const drawing = ref(false)
const reducedMotion = import.meta.client ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

async function draw(shuffle: boolean) {
  if (!selected.value || drawing.value) return
  drawing.value = true
  if (!reducedMotion) await new Promise(resolve => setTimeout(resolve, DRAW_ANIMATION_MS))
  await navigateTo({ path: `/play/${selected.value.slug}`, query: shuffle ? { shuffle: '1' } : {} })
}

onMounted(() => {
  drawing.value = false
})
</script>

<style scoped>
.home {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-5);
}
</style>
