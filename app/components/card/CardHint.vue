<template>
  <aside class="card-hint">
    <p class="card-hint-title">
      <Icon
        name="lucide:lightbulb"
        class="card-hint-icon"
        aria-hidden="true"
      />
      {{ copy.card.hint }}
    </p>
    <p class="card-hint-text">
      {{ hint }}
    </p>
  </aside>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

defineProps<{ hint: string }>()
</script>

<style scoped>
.card-hint {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border-radius: var(--radius-inner);
  background: var(--color-accent-soft);
}

.card-hint-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.card-hint-icon {
  width: var(--size-icon);
  height: var(--size-icon);
}

.card-hint-text {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-body);
}
</style>
