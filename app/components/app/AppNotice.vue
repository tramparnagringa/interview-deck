<template>
  <div
    class="app-notice"
    role="alert"
  >
    <p class="app-notice-text">
      {{ message }}
    </p>
    <UiButton
      v-if="actionLabel"
      variant="secondary"
      :to="actionTo"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
/** Inline error/empty state with an optional action. */
defineProps<{ message: string, actionLabel?: string, actionTo?: string }>()
defineEmits<{ action: [] }>()
</script>

<style scoped>
.app-notice {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  padding: var(--space-10) 0;
  text-align: center;
}

.app-notice-text {
  max-width: var(--size-card-max);
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}
</style>
