<template>
  <span
    :class="[
      'block animate-pulse bg-border',
      shape === 'block' ? 'h-24 rounded-panel' : 'h-4 rounded-pill',
      width === 'full' ? 'w-full' : width === 'half' ? 'w-1/2' : 'w-3/4',
    ]"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  shape?: 'line' | 'block'
  width?: 'full' | 'three-quarters' | 'half'
}>(), {
  shape: 'line',
  width: 'full',
})
</script>
