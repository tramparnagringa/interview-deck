<template>
  <UiPlayingCard>
    <template #header>
      <span class="card-face-category">
        <span
          class="card-face-dot"
          aria-hidden="true"
        />
        {{ card.category }}
      </span>
    </template>

    <h1 class="card-face-question">
      {{ card.question }}
    </h1>
    <UiAccentBar />
    <CardHint
      v-if="card.hint"
      :hint="card.hint"
    />
    <CardExample
      v-if="card.example"
      :example="card.example"
    />

    <template #footer>
      <UiOverline tag="span">
        {{ copy.card.wordmark }}
      </UiOverline>
    </template>
  </UiPlayingCard>
</template>

<script setup lang="ts">
import type { Card } from '#shared/schemas/deck'
import { copy } from '~/content/copy'

/** The white question card (screens 02 and 05). Hint and example answer only exist on Premium pages. */
defineProps<{ card: Card }>()
</script>

<style scoped>
.card-face-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-weight-semibold);
}

.card-face-dot {
  width: var(--size-dot);
  height: var(--size-dot);
  border-radius: var(--radius-pill);
  background: var(--deck-accent);
}

.card-face-question {
  margin: 0;
  font-size: var(--text-question);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-wrap: pretty;
}

@media (min-width: 48rem) {
  .card-face-question {
    font-size: var(--text-question-lg);
  }
}
</style>
