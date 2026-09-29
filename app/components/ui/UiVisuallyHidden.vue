<template>
  <component
    :is="tag"
    class="sr-only"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
/** Content for screen readers only (e.g. a live status that is already shown visually). */
withDefaults(defineProps<{ tag?: 'span' | 'p' | 'div' }>(), { tag: 'span' })
</script>
