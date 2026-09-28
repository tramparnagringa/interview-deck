<template>
  <span
    class="block h-(--size-accent-bar-h) w-(--size-accent-bar-w) rounded-pill bg-(--deck-accent)"
    :class="align === 'center' ? 'mx-auto' : ''"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
/** Short colored stroke in the current `--deck-accent`. */
withDefaults(defineProps<{ align?: 'start' | 'center' }>(), { align: 'start' })
</script>
