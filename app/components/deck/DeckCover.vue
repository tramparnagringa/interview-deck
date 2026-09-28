<template>
  <UiPlayingCard
    face="back"
    tag="div"
    fill
  >
    <template #header>
      <span class="deck-cover-label">
        <UiOverline
          tone="inverse"
          tag="span"
        >{{ copy.brand.wordmark }}</UiOverline>
      </span>
    </template>
    <div class="deck-cover-body">
      <UiAccentBar align="center" />
      <p class="deck-cover-title">
        {{ copy.home.coverTitle }}
        <span class="deck-cover-subtitle">{{ copy.home.coverSubtitle }}</span>
      </p>
    </div>
    <template #footer>
      <UiOverline
        tone="inverse"
        tag="span"
      >
        {{ copy.home.tapToDraw }}
      </UiOverline>
    </template>
  </UiPlayingCard>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
</script>

<style scoped>
.deck-cover-label {
  flex: 1;
  text-align: center;
}

.deck-cover-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  text-align: center;
}

.deck-cover-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.deck-cover-subtitle {
  display: block;
  color: var(--color-accent-soft-on-dark);
}
</style>
