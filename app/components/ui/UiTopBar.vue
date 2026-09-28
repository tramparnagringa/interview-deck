<template>
  <div class="grid min-h-(--size-touch) grid-cols-[1fr_auto_1fr] items-center gap-4">
    <div class="flex justify-start">
      <slot name="start" />
    </div>
    <div class="flex min-w-0 justify-center text-center">
      <slot />
    </div>
    <div class="flex justify-end">
      <slot name="end" />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Three-slot bar (start / centered title / end). */
</script>
