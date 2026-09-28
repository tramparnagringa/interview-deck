<template>
  <UiPanel :eyebrow="copy.feedback.tryThis">
    <p class="feedback-tip-text">
      {{ tip }}
    </p>
    <blockquote
      v-if="quote"
      class="feedback-tip-quote"
    >
      “<UiHighlight
        :text="quote"
        :marks="highlights"
      />”
    </blockquote>
  </UiPanel>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** "Try this": one concrete tip with the transcript excerpt it refers to. */
defineProps<{ tip: string, quote: string, highlights: string[] }>()
</script>

<style scoped>
.feedback-tip-text {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
}

.feedback-tip-quote {
  margin: 0;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-inner);
  background: var(--color-surface-muted);
  color: var(--color-ink-muted);
  line-height: var(--leading-body);
}
</style>
