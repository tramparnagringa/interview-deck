<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between gap-4">
      <span class="text-lg font-semibold text-ink">{{ label }}</span>
      <span
        v-if="note"
        class="text-right text-base text-ink-muted"
      >{{ note }}</span>
    </div>
    <div
      role="meter"
      :aria-label="label"
      :aria-valuenow="value"
      aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuetext="`${value} of ${max}`"
      class="flex gap-2"
    >
      <span
        v-for="segment in max"
        :key="segment"
        :class="[
          'h-(--size-score-bar-h) flex-1 rounded-pill',
          segment <= value ? 'bg-accent' : 'bg-border',
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Segmented score (e.g. 4 of 5) with a label and a short note. */
withDefaults(defineProps<{
  label: string
  value: number
  max?: number
  note?: string
}>(), {
  max: 5,
})
</script>
