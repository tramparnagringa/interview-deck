<template>
  <button
    type="button"
    :aria-label="label"
    :disabled="disabled"
    class="group relative block h-(--size-stack-h) w-(--size-stack-w) cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default"
    @click="$emit('select')"
  >
    <span
      class="absolute inset-0 rotate-(--rotate-stack-left) rounded-card border border-border bg-surface"
      aria-hidden="true"
    />
    <span
      class="absolute inset-0 rotate-(--rotate-stack-right) rounded-card border border-border bg-surface shadow-card"
      aria-hidden="true"
    />
    <span
      :class="[
        'absolute inset-0 flex transition-[translate,scale,opacity] duration-(--duration-card) ease-card',
        'group-hover:-translate-y-1 group-focus-visible:-translate-y-1',
        drawing ? '-translate-y-12 scale-105 opacity-0' : '',
      ]"
    >
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
/** A pile of cards; the default slot is the top card. The whole pile is one button. */
defineProps<{
  label: string
  drawing?: boolean
  disabled?: boolean
}>()

defineEmits<{ select: [] }>()
</script>
