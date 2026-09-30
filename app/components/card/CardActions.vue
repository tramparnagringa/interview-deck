<template>
  <div class="card-actions">
    <UiIconButton
      v-if="showBack"
      icon="lucide:arrow-left"
      :label="copy.card.previous"
      size="lg"
      :disabled="!canGoBack"
      @click="$emit('previous')"
    />
    <CardTimer
      ref="timer"
      :duration-seconds="durationSeconds"
      :ready="ready"
    />
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

/**
 * ‹ previous · answer timer · next ›, one per thumb. Stays at the bottom of the screen on phones.
 * Levels that can't go back (`showBack` false) get only the timer and next.
 */
defineProps<{ durationSeconds: number, ready: boolean, showBack: boolean, canGoBack: boolean }>()
defineEmits<{ next: [], previous: [] }>()

const timer = useTemplateRef<{ toggle: () => void }>('timer')
defineExpose({ toggle: () => timer.value?.toggle() })
</script>

<style scoped>
.card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 47.99rem) {
  .card-actions {
    position: sticky;
    z-index: 1;
    bottom: 0;
    padding-block: var(--space-3) calc(var(--space-3) + env(safe-area-inset-bottom, 0));
    background: linear-gradient(to top, var(--color-bg) 70%, transparent);
  }
}
</style>
