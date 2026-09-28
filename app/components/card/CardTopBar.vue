<template>
  <UiTopBar>
    <template #start>
      <UiIconButton
        icon="lucide:x"
        :label="closeLabel"
        :tone="tone"
        :to="closeTo"
        @click="$emit('close')"
      />
    </template>
    <slot />
  </UiTopBar>
</template>

<script setup lang="ts">
/** Close button + centered title (counter, status or screen title). */
withDefaults(defineProps<{
  closeLabel: string
  closeTo?: string
  tone?: 'light' | 'dark'
}>(), {
  tone: 'light',
})

defineEmits<{ close: [] }>()
</script>
