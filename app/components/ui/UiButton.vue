<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :class="classes"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
  >
    <Icon
      v-if="loading"
      name="lucide:loader-circle"
      class="size-(--size-icon) shrink-0 animate-spin"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      :class="['size-(--size-icon) shrink-0', iconClasses]"
      aria-hidden="true"
    />
    <span class="truncate">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

type Variant = 'primary' | 'secondary' | 'inverse' | 'link'
type IconTone = 'inherit' | 'accent'

const props = withDefaults(defineProps<{
  variant?: Variant
  /** Leading icon, e.g. "lucide:shuffle". */
  icon?: string
  iconTone?: IconTone
  /** Router location — renders a NuxtLink. */
  to?: string
  /** External URL — renders an anchor that opens in a new tab. */
  href?: string
  type?: 'button' | 'submit'
  block?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  iconTone: 'inherit',
  type: 'button',
})

const tag = computed(() => (props.to || props.href ? NuxtLink : 'button'))

const linkAttrs = computed(() => {
  if (props.href) return { to: props.href, external: true, target: '_blank', rel: 'noopener' }
  if (props.to) return { to: props.to }
  return { type: props.type }
})

const variantClasses: Record<Variant, string> = {
  primary: 'h-(--size-button) px-6 rounded-pill bg-ink text-ink-inverse hover:opacity-90',
  secondary: 'h-(--size-button) px-6 rounded-pill bg-surface text-ink border border-border hover:bg-surface-muted',
  inverse: 'h-(--size-button) px-6 rounded-pill bg-focus-ink text-ink hover:opacity-90',
  link: 'min-h-(--size-touch) px-2 text-ink-muted underline underline-offset-4 hover:text-ink',
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-3 font-sans text-lg font-semibold',
  'transition-opacity duration-(--duration-fast) cursor-pointer select-none',
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:opacity-50',
  variantClasses[props.variant],
  props.variant === 'link' ? 'underline' : '',
  props.block ? 'w-full' : '',
])

const iconClasses = computed(() => {
  if (props.iconTone !== 'accent') return ''
  return props.variant === 'primary' ? 'text-accent-soft-on-dark' : 'text-accent'
})
</script>
