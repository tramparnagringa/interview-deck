<template>
  <div class="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div
      class="flex w-max gap-3 py-1"
      role="group"
      :aria-label="label"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Horizontal, swipeable row that bleeds to the screen edge. */
defineProps<{ label: string }>()
</script>
