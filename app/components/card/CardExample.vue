<template>
  <details class="card-example">
    <summary class="card-example-toggle">
      <Icon
        name="lucide:message-square-quote"
        class="card-example-icon"
        aria-hidden="true"
      />
      {{ copy.card.example }}
      <Icon
        name="lucide:chevron-down"
        class="card-example-chevron"
        aria-hidden="true"
      />
    </summary>
    <blockquote class="card-example-text">
      {{ example }}
    </blockquote>
    <p class="card-example-note">
      {{ copy.card.exampleNote }}
    </p>
  </details>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** Premium: a model answer, closed by default so the candidate tries first. */
defineProps<{ example: string }>()
</script>

<style scoped>
.card-example {
  border-top: 1px solid var(--color-border);
}

.card-example-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--size-touch);
  color: var(--color-accent-ink);
  font-weight: var(--font-weight-semibold);
  list-style: none;
  cursor: pointer;
}

.card-example-toggle::-webkit-details-marker {
  display: none;
}

.card-example-icon {
  width: var(--size-icon);
  height: var(--size-icon);
}

.card-example-chevron {
  width: var(--size-icon-sm);
  height: var(--size-icon-sm);
  margin-left: auto;
  transition: transform var(--duration-fast) var(--ease-card);
}

.card-example[open] .card-example-chevron {
  transform: rotate(180deg);
}

.card-example-text {
  margin: 0;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-inner);
  background: var(--color-surface-muted);
  font-size: var(--text-lg);
  line-height: var(--leading-body);
}

.card-example-note {
  margin: var(--space-3) 0 0;
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
}
</style>
