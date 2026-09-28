<template>
  <UiScroller :label="copy.home.decks">
    <UiChip
      v-for="deck in decks"
      :key="deck.slug"
      :style="deckAccentStyle(deck.color)"
      :label="deck.shortName"
      :meta="deck.slug === modelValue ? copy.home.cards(deck.cards.length) : undefined"
      :selected="deck.slug === modelValue"
      interactive
      @click="$emit('update:modelValue', deck.slug)"
    />
  </UiScroller>
</template>

<script setup lang="ts">
import type { Deck } from '#shared/schemas/deck'
import { copy } from '~/content/copy'
import { deckAccentStyle } from '~/utils/deck'

/** Deck chips, each with its deck color (screens 01 and 04). */
defineProps<{
  decks: Deck[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [slug: string] }>()
</script>
