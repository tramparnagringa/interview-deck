<template>
  <svg
    :class="['app-tng-mark', size === 'sm' ? 'app-tng-mark-sm' : 'app-tng-mark-md']"
    viewBox="0 0 200 200"
    aria-hidden="true"
  >
    <circle
      class="app-tng-mark-disc"
      cx="100"
      cy="100"
      r="92"
    />
    <circle
      class="app-tng-mark-ring"
      cx="100"
      cy="100"
      r="78"
      stroke-width="1.5"
    />
    <g transform="rotate(15 100 100)">
      <polygon
        class="app-tng-mark-arrow"
        points="100,48 134,100 66,100"
      />
      <polygon
        class="app-tng-mark-arrow-soft"
        points="66,100 134,100 100,152"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
/** Trampar na Gringa mark. Decorative: it always sits next to the brand name. */
withDefaults(defineProps<{ size?: 'md' | 'sm' }>(), { size: 'md' })
</script>

<style scoped>
.app-tng-mark {
  flex-shrink: 0;
}

.app-tng-mark-md {
  width: var(--size-logo);
  height: var(--size-logo);
}

.app-tng-mark-sm {
  width: var(--size-icon);
  height: var(--size-icon);
}

.app-tng-mark-disc {
  fill: var(--color-tng-disc);
}

.app-tng-mark-ring {
  fill: none;
  stroke: var(--color-tng-ring);
}

.app-tng-mark-arrow {
  fill: var(--color-tng-arrow);
}

.app-tng-mark-arrow-soft {
  fill: var(--color-tng-arrow-soft);
}
</style>
