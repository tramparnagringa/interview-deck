<template>
  <div
    class="layout-default"
    :class="{ 'layout-default-focus': focus }"
  >
    <div class="layout-default-page">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const focus = useState('focus-mode', () => false)
</script>

<style scoped>
.layout-default {
  min-height: var(--size-screen);
  background: var(--color-bg);
  color: var(--color-ink);
  transition: background-color var(--duration-card) var(--ease-card);
}

.layout-default-focus {
  background: var(--color-focus-bg);
  color: var(--color-focus-ink);
}

.layout-default-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: var(--size-screen);
  max-width: calc(var(--size-page-max) + 2 * var(--space-5));
  margin: 0 auto;
  padding: var(--space-5) var(--space-5) var(--space-6);
}
</style>
