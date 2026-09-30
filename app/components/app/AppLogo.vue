<template>
  <NuxtLink
    :to="basePath || '/'"
    class="app-logo"
  >
    <AppTngMark />
    <span class="app-logo-text">
      <span class="app-logo-name">{{ copy.brand.wordmark }}</span>
      <span class="app-logo-by">{{ copy.brand.by }}</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

const { basePath } = useLevel()
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--size-touch);
  color: var(--color-ink);
  text-decoration: none;
}

.app-logo-text {
  display: flex;
  flex-direction: column;
}

.app-logo-name {
  line-height: var(--leading-tight);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}
.app-logo-by {
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
</style>
