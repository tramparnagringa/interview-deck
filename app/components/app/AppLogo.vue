<template>
  <NuxtLink
    to="/"
    class="app-logo"
  >
    <span
      class="app-logo-mark"
      aria-hidden="true"
    >
      <span class="app-logo-card app-logo-card-back" />
      <span class="app-logo-card app-logo-card-front" />
    </span>
    <span class="app-logo-name">{{ copy.brand.wordmark }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
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

.app-logo-mark {
  position: relative;
  width: var(--size-logo);
  height: var(--size-logo);
}

.app-logo-card {
  position: absolute;
  top: 0;
  width: calc(var(--size-logo) * 0.62);
  height: 100%;
  border-radius: var(--radius-sm);
}

.app-logo-card-back {
  left: 0;
  background: var(--color-ink);
  transform: rotate(var(--rotate-stack-left));
}

.app-logo-card-front {
  right: 0;
  background: var(--color-accent);
  transform: rotate(var(--rotate-stack-right));
}

.app-logo-name {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}
</style>
