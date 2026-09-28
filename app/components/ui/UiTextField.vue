<template>
  <div class="flex flex-col gap-2">
    <label
      :for="id"
      class="text-base font-semibold text-ink"
    >{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="h-(--size-button) rounded-pill border border-border bg-surface px-6 font-sans text-lg text-ink placeholder:text-ink-muted aria-invalid:border-danger"
    >
    <p
      v-if="error"
      :id="`${id}-error`"
      class="m-0 text-sm text-danger"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  type?: 'text' | 'email'
  name?: string
  autocomplete?: string
  placeholder?: string
  required?: boolean
  error?: string
}>(), {
  type: 'text',
})

const model = defineModel<string>({ default: '' })
const id = useId()
</script>
