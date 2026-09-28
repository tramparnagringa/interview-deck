<template>
  <UiPanel>
    <UiScoreBar
      v-for="key in criteria"
      :key="key"
      :label="copy.feedback.criteria[key]"
      :value="scores[key].score"
      :note="scores[key].note"
    />
  </UiPanel>
</template>

<script setup lang="ts">
import type { AiFeedback } from '#shared/schemas/feedback'
import { copy } from '~/content/copy'

defineProps<{ scores: AiFeedback['scores'] }>()

const criteria = ['structure', 'specificity', 'clarity'] as const
</script>
