<template>
  <div class="layout-focus">
    <div class="layout-focus-page">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout-focus {
  min-height: var(--size-screen);
  background: var(--color-focus-bg);
  color: var(--color-focus-ink);
}

.layout-focus-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: var(--size-screen);
  max-width: calc(var(--size-page-max) + 2 * var(--space-5));
  margin: 0 auto;
  padding: var(--space-5) var(--space-5) var(--space-6);
}
</style>
