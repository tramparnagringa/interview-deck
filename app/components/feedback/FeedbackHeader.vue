<template>
  <CardTopBar
    :close-label="copy.feedback.close"
    :close-to="closeTo"
  >
    <p class="feedback-header-title">
      <Icon
        name="lucide:sparkle"
        class="feedback-header-icon"
        aria-hidden="true"
      />
      {{ copy.feedback.title }}
    </p>
  </CardTopBar>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

defineProps<{ closeTo: string }>()
</script>

<style scoped>
.feedback-header-title {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}

.feedback-header-icon {
  width: var(--size-icon);
  height: var(--size-icon);
  color: var(--color-accent);
}
</style>
