<template>
  <p
    class="m-0 inline-flex items-center gap-2 text-lg"
    :class="inverse ? 'text-focus-ink-muted' : 'text-ink-muted'"
    role="status"
    aria-live="polite"
  >
    <span
      :class="[
        'size-(--size-dot) rounded-pill',
        tone === 'accent' ? 'bg-accent-on-dark' : tone === 'danger' ? 'bg-danger' : 'bg-focus-ink-muted',
        pulse ? 'animate-pulse' : '',
      ]"
      aria-hidden="true"
    />
    <slot />
  </p>
</template>

<script setup lang="ts">
/** Status line with a dot. Announced to screen readers (aria-live). */
withDefaults(defineProps<{
  tone?: 'accent' | 'muted' | 'danger'
  pulse?: boolean
  inverse?: boolean
}>(), {
  tone: 'accent',
})
</script>
