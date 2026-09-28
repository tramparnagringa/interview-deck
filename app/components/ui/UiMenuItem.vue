<template>
  <component
    :is="to || href ? NuxtLink : 'button'"
    v-bind="attrs"
    class="flex min-h-(--size-touch) w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent px-3 text-left font-sans text-base text-ink no-underline hover:bg-surface-muted"
  >
    <Icon
      v-if="icon"
      :name="icon"
      class="size-(--size-icon-sm) text-ink-muted"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

const props = defineProps<{
  icon?: string
  to?: string
  href?: string
}>()

const attrs = computed(() => {
  if (props.href) return { to: props.href, external: true, target: '_blank', rel: 'noopener' }
  if (props.to) return { to: props.to }
  return { type: 'button' as const }
})
</script>
