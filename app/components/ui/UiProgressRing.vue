<template>
  <div class="relative grid size-(--size-ring) place-items-center">
    <svg
      class="absolute inset-0 size-full -rotate-90"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
        class="stroke-focus-border"
      />
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="stroke-accent-on-dark transition-[stroke-dashoffset] duration-(--duration-fast) ease-linear"
      />
    </svg>
    <div class="relative flex flex-col items-center gap-2 text-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Circular countdown. `progress` is the fraction still remaining, from 1 to 0. */
const props = defineProps<{ progress: number }>()

// SVG user units (viewBox is 100x100), not CSS sizes.
const strokeWidth = 2.5
const radius = 50 - strokeWidth
const circumference = 2 * Math.PI * radius

const offset = computed(() => {
  const clamped = Math.min(1, Math.max(0, props.progress))
  return circumference * (1 - clamped)
})
</script>
