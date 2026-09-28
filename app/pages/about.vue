<template>
  <main class="about">
    <CardTopBar
      :close-label="copy.about.back"
      close-to="/"
    />
    <h1 class="about-title">
      {{ copy.about.title }}
    </h1>
    <p
      v-for="paragraph in copy.about.body"
      :key="paragraph"
      class="about-text"
    >
      {{ paragraph }}
    </p>
    <p class="about-credit">
      {{ copy.about.madeBy }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

useHead({ title: `${copy.about.title} · ${copy.brand.name}` })
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.about-title {
  margin: var(--space-6) 0 0;
  font-size: var(--text-title);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.about-text {
  margin: 0;
  font-size: var(--text-lg);
}

.about-credit {
  margin: var(--space-4) 0 0;
  color: var(--color-ink-muted);
}
</style>
