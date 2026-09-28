<template>
  <NuxtLink
    :to="href"
    external
    target="_blank"
    rel="noopener"
    class="flex min-h-(--size-touch) items-center gap-4 rounded-panel bg-cta-bg px-4 py-4 text-cta-ink no-underline transition-opacity duration-(--duration-fast) hover:opacity-90"
  >
    <Icon
      :name="icon"
      class="size-(--size-icon-sm) shrink-0"
      aria-hidden="true"
    />
    <span class="flex-1 text-base leading-snug">
      <strong
        v-if="lead"
        class="font-semibold"
      >{{ lead }}</strong>
      <slot />
    </span>
    <Icon
      name="lucide:chevron-right"
      class="size-(--size-icon-sm) shrink-0"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
/** Yellow call-to-action block that links out (PRD 6.1). */
withDefaults(defineProps<{
  href: string
  /** Bold lead-in text before the body. */
  lead?: string
  icon?: string
}>(), {
  icon: 'lucide:sparkle',
})
</script>
