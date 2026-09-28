<template>
  <UiPanel
    tone="dark"
    :eyebrow="copy.feedback.followUp"
  >
    <p class="feedback-follow-up-text">
      {{ question }}
    </p>
  </UiPanel>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

defineProps<{ question: string }>()
</script>

<style scoped>
.feedback-follow-up-text {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
}
</style>
