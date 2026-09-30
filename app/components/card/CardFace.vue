<template>
  <UiPlayingCard>
    <template #header>
      <span class="card-face-category">
        <span
          class="card-face-dot"
          aria-hidden="true"
        />
        {{ card.category }}
      </span>
      <CardAudio
        v-if="audioSource"
        :card="card"
        @finished="$emit('audioFinished')"
      />
    </template>

    <h1 class="card-face-question">
      {{ card.question }}
    </h1>
    <UiAccentBar />
    <CardHint
      v-if="card.hint"
      :hint="card.hint"
    />
    <CardExample
      v-if="card.example"
      :example="card.example"
    />
    <CardRecorder
      :category="card.category"
      :question="card.question"
    />

    <template #footer>
      <span class="card-face-brand">
        <AppTngMark size="sm" />
        <UiOverline tag="span">
          {{ copy.brand.by }}
        </UiOverline>
      </span>
    </template>
  </UiPlayingCard>
</template>

<script setup lang="ts">
import type { Card } from '#shared/schemas/deck'
import { copy } from '~/content/copy'
import { audioSourceForCard } from '~/utils/audio'

/** The white question card (screens 02 and 05). Hint and example answer only exist on Premium pages. */
const props = defineProps<{ card: Card }>()
/** `audioFinished`: the question was read aloud (or skipped); cards without audio emit it right away. */
const emit = defineEmits<{ audioFinished: [] }>()
const audioSource = computed(() => audioSourceForCard(props.card))
onMounted(() => {
  if (!audioSource.value) emit('audioFinished')
})
</script>

<style scoped>
.card-face-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.card-face-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-weight-semibold);
}

.card-face-dot {
  width: var(--size-dot);
  height: var(--size-dot);
  border-radius: var(--radius-pill);
  background: var(--deck-accent);
}

.card-face-question {
  margin: 0;
  font-size: var(--text-question);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-wrap: pretty;
}

@media (min-width: 48rem) {
  .card-face-question {
    font-size: var(--text-question-lg);
  }
}
</style>
