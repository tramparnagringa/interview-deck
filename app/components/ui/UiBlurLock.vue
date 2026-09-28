<template>
  <div class="relative">
    <div
      class="pointer-events-none select-none blur-(--size-blur)"
      aria-hidden="true"
      inert
    >
      <slot />
    </div>
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Blurred, non-interactive preview with an overlaid action (locked content). */
</script>
