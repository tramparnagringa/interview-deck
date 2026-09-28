<template>
  <header class="app-header">
    <AppLogo />
    <UiBadge v-if="isPremium">
      {{ copy.brand.premium }}
    </UiBadge>
    <AppMenu />
  </header>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

const { isPremium } = usePlan()
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
</style>
