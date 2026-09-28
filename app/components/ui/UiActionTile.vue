<template>
  <NuxtLink
    :to="to ?? href"
    :external="!!href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener' : undefined"
    class="flex min-h-(--size-touch) items-center gap-3 rounded-panel border border-border bg-surface p-4 text-ink no-underline transition-colors duration-(--duration-fast) hover:bg-surface-muted"
  >
    <Icon
      :name="icon"
      :class="['size-(--size-icon) shrink-0', iconTone === 'accent' ? 'text-accent' : 'text-ink']"
      aria-hidden="true"
    />
    <span class="flex flex-col">
      <span class="text-lg font-semibold leading-tight">{{ title }}</span>
      <span
        v-if="subtitle"
        class="text-base leading-snug text-ink-muted"
      >{{ subtitle }}</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
/** Bordered shortcut tile with icon, title and subtitle. Use `to` (internal) or `href` (external). */
withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon: string
  iconTone?: 'accent' | 'ink'
  to?: string
  href?: string
}>(), {
  iconTone: 'ink',
})
</script>
