<template>
  <component
    :is="to ? NuxtLink : 'button'"
    v-bind="to ? { to } : { type: 'button' }"
    :aria-label="label"
    :title="label"
    :aria-pressed="pressed"
    :disabled="to ? undefined : disabled"
    :class="classes"
  >
    <Icon
      :name="icon"
      class="size-(--size-icon)"
      aria-hidden="true"
    />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

const props = withDefaults(defineProps<{
  icon: string
  /** Accessible name — required because the button has no visible text. */
  label: string
  to?: string
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
  pressed?: boolean
  disabled?: boolean
}>(), {
  tone: 'light',
  size: 'md',
  pressed: undefined,
})

const classes = computed(() => [
  'inline-flex shrink-0 items-center justify-center rounded-pill border cursor-pointer',
  'transition-colors duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-40',
  props.size === 'lg' ? 'size-(--size-button)' : 'size-(--size-touch)',
  props.tone === 'dark'
    ? 'border-focus-border bg-transparent text-focus-ink hover:bg-focus-surface'
    : 'border-border bg-surface text-ink hover:bg-surface-muted',
])
</script>
