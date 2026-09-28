<template>
  <component
    :is="tag"
    :class="[
      'm-0 text-caption font-medium uppercase tracking-label',
      tone === 'inverse' ? 'text-focus-ink-muted' : 'text-ink-muted',
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
/** Small letter-spaced uppercase label ("INTERVIEW DECK"). */
withDefaults(defineProps<{
  tone?: 'muted' | 'inverse'
  tag?: 'p' | 'span' | 'h2' | 'h3'
}>(), {
  tone: 'muted',
  tag: 'p',
})
</script>
