<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="grid auto-cols-fr grid-flow-col gap-1 rounded-pill border border-border bg-surface p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === modelValue"
      :class="[
        'min-h-(--size-touch) cursor-pointer rounded-pill border-0 px-4 font-sans text-base font-semibold',
        'transition-colors duration-(--duration-fast)',
        option.value === modelValue ? 'bg-ink text-ink-inverse' : 'bg-transparent text-ink hover:bg-surface-muted',
      ]"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
/** Pill-shaped single choice between a few options (a radio group). */
defineProps<{
  label: string
  options: { value: T, label: string }[]
  modelValue: T
}>()

defineEmits<{ 'update:modelValue': [value: T] }>()
</script>
