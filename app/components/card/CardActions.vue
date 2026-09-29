<template>
  <div class="card-actions">
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

defineProps<{ durationSeconds: number, ready: boolean }>()
defineEmits<{ next: [] }>()

const timer = useTemplateRef<{ toggle: () => void }>('timer')
defineExpose({ toggle: () => timer.value?.toggle() })
</script>

<style scoped>
.card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
