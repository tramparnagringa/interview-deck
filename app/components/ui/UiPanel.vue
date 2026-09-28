<template>
  <component
    :is="tag"
    :class="[
      'flex flex-col gap-4 rounded-panel p-6',
      tone === 'dark' ? 'bg-ink text-ink-inverse' : 'border border-border bg-surface text-ink',
    ]"
  >
    <p
      v-if="eyebrow"
      :class="[
        'm-0 text-base font-semibold',
        tone === 'dark' ? 'text-accent-soft-on-dark' : 'text-accent',
      ]"
    >
      {{ eyebrow }}
    </p>
    <slot />
  </component>
</template>

<script setup lang="ts">
/** Rounded content block, optionally with a colored eyebrow title. */
withDefaults(defineProps<{
  eyebrow?: string
  tone?: 'light' | 'dark'
  tag?: 'section' | 'div' | 'aside'
}>(), {
  tone: 'light',
  tag: 'section',
})
</script>
