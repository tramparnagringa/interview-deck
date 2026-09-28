<template>
  <div class="deck-stack">
    <UiCardStack
      :label="copy.home.drawLabel"
      :drawing="drawing"
      :disabled="disabled"
      @select="$emit('draw')"
    >
      <DeckCover />
    </UiCardStack>
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** The deck on the Home screen. Tapping it draws a card. */
defineProps<{ drawing?: boolean, disabled?: boolean }>()
defineEmits<{ draw: [] }>()
</script>

<style scoped>
.deck-stack {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) 0;
}
</style>
