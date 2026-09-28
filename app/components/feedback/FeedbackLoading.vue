<template>
  <div
    class="feedback-loading"
    role="status"
    aria-live="polite"
  >
    <p class="feedback-loading-text">
      {{ copy.feedback.loading }}
    </p>
    <UiSkeleton width="three-quarters" />
    <UiSkeleton shape="block" />
    <UiSkeleton shape="block" />
    <UiSkeleton
      shape="block"
      width="full"
    />
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
</script>

<style scoped>
.feedback-loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feedback-loading-text {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}
</style>
