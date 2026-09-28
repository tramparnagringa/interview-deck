<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    :aria-pressed="interactive ? selected : undefined"
    :class="[
      'inline-flex min-h-(--size-touch) shrink-0 items-center gap-2 rounded-pill border bg-surface px-4',
      'font-sans text-base font-semibold text-ink whitespace-nowrap',
      interactive ? 'cursor-pointer transition-colors duration-(--duration-fast) hover:bg-surface-muted' : '',
      selected ? 'border-ink' : 'border-border',
    ]"
  >
    <span
      class="size-(--size-dot) rounded-pill bg-(--deck-accent)"
      aria-hidden="true"
    />
    <span>{{ label }}</span>
    <span
      v-if="meta"
      class="font-regular text-ink-muted"
    >· {{ meta }}</span>
    <Icon
      v-if="locked"
      name="lucide:lock"
      class="size-(--size-icon-sm) text-ink-muted"
      aria-label="Locked"
    />
  </component>
</template>

<script setup lang="ts">
/** Pill with a colored dot. The dot color comes from the `--deck-accent` CSS var of an ancestor. */
withDefaults(defineProps<{
  label: string
  meta?: string
  selected?: boolean
  locked?: boolean
  interactive?: boolean
}>(), {
  interactive: false,
})
</script>
