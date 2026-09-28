<template>
  <div
    v-if="!isPremium"
    class="deck-picker"
  >
    <UiChip
      v-if="current"
      :style="deckAccentStyle(current.color)"
      :label="current.name"
      :meta="copy.home.cards(current.cardCount)"
    />
  </div>
  <UiScroller
    v-else
    :label="copy.home.decks"
  >
    <UiChip
      v-for="deck in decks"
      :key="deck.slug"
      :style="deckAccentStyle(deck.color)"
      :label="deck.shortName"
      :selected="deck.slug === modelValue"
      interactive
      @click="$emit('update:modelValue', deck.slug)"
    />
  </UiScroller>
</template>

<script setup lang="ts">
import type { Deck } from '#shared/schemas/deck'
import { copy } from '~/content/copy'

/** Free: the current deck as a chip (screen 01). Premium: every deck as selectable chips (screen 04). */
const props = defineProps<{
  decks: Deck[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [slug: string] }>()

const { isPremium } = usePlan()
const current = computed(() => props.decks.find(deck => deck.slug === props.modelValue))
</script>

<style scoped>
.deck-picker {
  display: flex;
}
</style>
