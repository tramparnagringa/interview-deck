<template>
  <section
    class="play-mock-complete"
    aria-live="polite"
  >
    <UiAccentBar align="center" />
    <h1 class="play-mock-complete-title">
      {{ copy.mockComplete.title }}
    </h1>
    <p class="play-mock-complete-body">
      {{ copy.mockComplete.body(answered) }}
    </p>
    <div class="play-mock-complete-actions">
      <UiButton
        icon="lucide:rotate-ccw"
        block
        @click="$emit('again')"
      >
        {{ copy.mockComplete.again }}
      </UiButton>
      <UiButton
        variant="secondary"
        block
        :to="homeTo"
      >
        {{ copy.mockComplete.back }}
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** End of a mock interview (Premium). */
defineProps<{ answered: number, homeTo: string }>()
defineEmits<{ again: [] }>()
</script>

<style scoped>
.play-mock-complete {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  text-align: center;
}

.play-mock-complete-title {
  margin: 0;
  font-size: var(--text-question);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.play-mock-complete-body {
  max-width: var(--size-card-max);
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}

.play-mock-complete-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-4);
}
</style>
