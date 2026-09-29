<template>
  <section
    class="card-recorder"
    data-no-swipe
    :aria-label="copy.card.recorder.label"
  >
    <UiButton
      v-if="recorder.status.value === 'idle' || recorder.status.value === 'error'"
      variant="secondary"
      icon="lucide:video"
      block
      @click="start"
    >
      {{ copy.card.recorder.start }}
    </UiButton>
    <p
      v-if="recorder.status.value === 'error'"
      class="card-recorder-note"
      role="alert"
    >
      {{ copy.card.recorder.error }}
    </p>

    <template v-if="recorder.status.value === 'starting' || recorder.status.value === 'recording'">
      <video
        ref="live"
        class="card-recorder-video card-recorder-video-live"
        autoplay
        muted
        playsinline
      />
      <UiButton
        variant="secondary"
        icon="lucide:square"
        block
        :loading="recorder.status.value === 'starting'"
        @click="recorder.stop"
      >
        {{ copy.card.recorder.stop }}
      </UiButton>
    </template>

    <template v-if="recorder.status.value === 'recorded' && recorder.videoUrl.value">
      <video
        class="card-recorder-video card-recorder-video-result"
        :src="recorder.videoUrl.value"
        controls
        playsinline
      />
      <div class="card-recorder-actions">
        <UiButton
          icon="lucide:download"
          block
          @click="recorder.save"
        >
          {{ copy.card.recorder.save }}
        </UiButton>
        <UiIconButton
          icon="lucide:trash-2"
          :label="copy.card.recorder.discard"
          size="lg"
          @click="recorder.discard"
        />
      </div>
    </template>
    <p
      v-if="recorder.status.value !== 'error'"
      class="card-recorder-note"
    >
      {{ copy.card.recorder.privacy }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** Every level: record a video of the answer, with the question on it, to watch back or post. */
const props = defineProps<{ category: string, question: string }>()

const recorder = useAnswerRecorder()
const live = useTemplateRef<HTMLVideoElement>('live')

watch([live, recorder.preview], ([video, stream]) => {
  if (video) video.srcObject = stream
})

function start() {
  void recorder.start({ category: props.category, question: props.question, brand: copy.card.recorder.brand })
}
</script>

<style scoped>
.card-recorder {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card-recorder-video {
  width: 100%;
  max-height: var(--size-recorder-video-h);
  border-radius: var(--radius-inner);
  background: var(--color-focus-bg);
  object-fit: cover;
}

.card-recorder-video-live {
  transform: scaleX(-1);
}

/* The recorded video is portrait: show all of it. */
.card-recorder-video-result {
  aspect-ratio: 9 / 16;
  object-fit: contain;
}

.card-recorder-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card-recorder-note {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
  text-align: center;
}
</style>
