<template>
  <div class="layout-default">
    <div class="layout-default-page">
      <slot v-if="isPublicPath(route.path)" />
      <!-- Everything else depends on the session, which only exists in the browser: prerendered
           empty, so a signed-out visitor never sees a page before being sent to the login. -->
      <ClientOnly v-else>
        <slot />
        <template #fallback>
          <div
            class="layout-default-loading"
            aria-busy="true"
          />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPublicPath } from '~/utils/access'

const route = useRoute()
</script>

<style scoped>
.layout-default {
  min-height: var(--size-screen);
  background: var(--color-bg);
  color: var(--color-ink);
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

.layout-default-loading {
  flex: 1;
}
</style>
