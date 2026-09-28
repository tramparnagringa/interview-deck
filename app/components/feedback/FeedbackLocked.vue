<template>
  <article class="feedback-locked">
    <header class="feedback-locked-heading">
      <p class="feedback-locked-question">
        {{ question }}
      </p>
      <h1 class="feedback-locked-title">
        {{ copy.feedback.lockedTitle }}
      </h1>
    </header>
    <UiBlurLock>
      <div class="feedback-locked-preview">
        <FeedbackScores :scores="PREVIEW.scores" />
        <FeedbackTip
          :tip="PREVIEW.tip"
          :quote="PREVIEW.quote"
          :highlights="[]"
        />
      </div>
      <template #action>
        <Icon
          name="lucide:lock"
          class="feedback-locked-icon"
          aria-hidden="true"
        />
      </template>
    </UiBlurLock>
  </article>
</template>

<script setup lang="ts">
import type { AiFeedback } from '#shared/schemas/feedback'
import { copy } from '~/content/copy'

/**
 * Free without credit (PRD 6.3): a blurred placeholder, not real feedback. The AI was not called.
 * The unlock link is the screen's CtaSkool.
 */
defineProps<{ question: string }>()

const PREVIEW: Pick<AiFeedback, 'scores' | 'tip' | 'quote'> = {
  scores: {
    structure: { score: 4, note: 'Clear arc' },
    specificity: { score: 3, note: 'Add numbers' },
    clarity: { score: 4, note: 'Easy to follow' },
  },
  tip: 'Lead with the result, then explain the steps you took.',
  quote: '…and in the end the project was delivered…',
}
</script>

<style scoped>
.feedback-locked {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feedback-locked-heading {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.feedback-locked-question {
  overflow: hidden;
  margin: 0;
  color: var(--color-ink-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-locked-title {
  margin: 0;
  font-size: var(--text-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.feedback-locked-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feedback-locked-icon {
  width: var(--size-touch);
  height: var(--size-touch);
  padding: var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-ink-inverse);
}
</style>
