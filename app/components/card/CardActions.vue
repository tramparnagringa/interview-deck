<template>
  <div class="card-actions">
    <div class="card-actions-row">
      <UiButton
        v-if="isPremium"
        icon="lucide:sparkle"
        icon-tone="accent"
        block
        :loading="busy"
        @click="$emit('answer', 'ai')"
      >
        {{ copy.card.answerWithAi }}
      </UiButton>
      <UiButton
        v-else
        icon="lucide:timer"
        icon-tone="accent"
        block
        :loading="busy"
        @click="$emit('answer', 'default')"
      >
        {{ copy.card.answer(duration) }}
      </UiButton>
      <UiIconButton
        icon="lucide:arrow-right"
        :label="copy.card.next"
        size="lg"
        @click="$emit('next')"
      />
    </div>
    <div
      v-if="isPremium"
      class="card-actions-secondary"
    >
      <UiButton
        variant="link"
        @click="$emit('answer', 'timer')"
      >
        {{ copy.card.justTimer }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

export type AnswerKind = 'default' | 'ai' | 'timer'

defineProps<{ isPremium: boolean, duration: string, busy?: boolean }>()
defineEmits<{ answer: [kind: AnswerKind], next: [] }>()
</script>

<style scoped>
.card-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-actions-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card-actions-secondary {
  display: flex;
  justify-content: center;
}
</style>
