<template>
  <section class="answer-question">
    <p class="answer-question-meta">
      <span
        class="answer-question-dot"
        aria-hidden="true"
      />
      {{ meta }}
    </p>
    <h1 class="answer-question-text">
      {{ question }}
    </h1>
  </section>
</template>

<script setup lang="ts">
/** Compact question on the dark answering screen. */
defineProps<{ meta: string, question: string }>()
</script>

<style scoped>
.answer-question {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: 1px solid var(--color-focus-border);
  border-radius: var(--radius-panel);
  background: var(--color-focus-surface);
}

.answer-question-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--color-focus-ink-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.answer-question-dot {
  width: var(--size-dot);
  height: var(--size-dot);
  border-radius: var(--radius-pill);
  background: var(--color-accent-on-dark);
}

.answer-question-text {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
}
</style>
