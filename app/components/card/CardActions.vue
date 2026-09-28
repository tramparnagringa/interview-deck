<template>
  <div class="card-actions">
    <UiButton
      icon="lucide:timer"
      icon-tone="accent"
      block
      @click="$emit('answer')"
    >
      {{ copy.card.answer(duration) }}
    </UiButton>
    <UiIconButton
      icon="lucide:arrow-right"
      :label="copy.card.next"
      size="lg"
      @click="$emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

defineProps<{ duration: string }>()
defineEmits<{ answer: [], next: [] }>()
</script>

<style scoped>
.card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
