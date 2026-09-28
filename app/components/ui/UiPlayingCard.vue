<template>
  <component
    :is="tag"
    :class="[
      'relative flex w-full max-w-(--size-card-max) flex-col rounded-card p-6 md:p-10',
      face === 'front'
        ? 'border border-border bg-surface text-ink shadow-card'
        : 'bg-focus-bg text-focus-ink shadow-stack',
      fill ? 'h-full' : 'min-h-(--size-card-min-h)',
    ]"
  >
    <header
      v-if="$slots.header"
      class="flex items-center justify-between gap-4"
    >
      <slot name="header" />
    </header>
    <div class="flex flex-1 flex-col justify-center gap-6 py-6">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="flex justify-center"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
/** A playing card: white face (question) or black back (deck cover). */
withDefaults(defineProps<{
  face?: 'front' | 'back'
  tag?: 'article' | 'div' | 'section'
  /** Stretch to the parent's height instead of using the minimum card height. */
  fill?: boolean
}>(), {
  face: 'front',
  tag: 'article',
})
</script>
