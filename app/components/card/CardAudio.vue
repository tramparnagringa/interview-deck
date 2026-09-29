<template>
  <div class="card-audio">
    <div
      v-if="features.voicePicker"
      class="card-audio-voice-picker"
    >
      <button
        type="button"
        class="card-audio-voice-trigger"
        :aria-label="copy.card.audio.voiceLabel"
        aria-haspopup="listbox"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span aria-hidden="true">{{ selectedOption.emoji }}</span>
      </button>
      <div
        v-if="menuOpen"
        class="card-audio-voice-menu"
        role="listbox"
        :aria-label="copy.card.audio.voiceLabel"
      >
        <button
          v-for="option in voiceOptions"
          :key="option.value"
          type="button"
          class="card-audio-voice-option"
          :class="{ 'card-audio-voice-option-selected': choice === option.value }"
          role="option"
          :aria-selected="choice === option.value"
          :aria-label="option.label"
          :title="option.label"
          @click="selectChoice(option.value)"
        >
          <span aria-hidden="true">{{ option.emoji }}</span>
        </button>
      </div>
    </div>
    <UiIconButton
      :icon="playing ? 'lucide:pause' : 'lucide:play'"
      :label="playing ? copy.card.audio.stop : copy.card.audio.play"
      @click="toggle"
    />
    <audio
      ref="player"
      class="card-audio-player"
      :src="src ?? undefined"
      preload="none"
      @ended="playing = false"
      @pause="playing = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Card } from '#shared/schemas/deck'
import type { AudioChoice } from '~/composables/useAudioPreference'
import { copy } from '~/content/copy'
import { audioSourceForCard } from '~/utils/audio'

const props = defineProps<{ card: Card }>()
const { features } = useLevel()
const { choice, autoplay, voice } = useAudioPreference()
const src = computed(() => audioSourceForCard(props.card, voice.value))
const menuOpen = ref(false)
const voiceOptions: Array<{ value: AudioChoice, label: string, emoji: string }> = [
  { value: 'hale-v3-expressive', label: copy.card.audio.voices.male, emoji: '👨' },
  { value: 'neha-messy-relatable', label: copy.card.audio.voices.female, emoji: '👩' },
  { value: 'off', label: copy.card.audio.voices.off, emoji: '🔇' },
]
const selectedOption = computed(() => voiceOptions.find(option => option.value === choice.value) ?? voiceOptions[0]!)

const player = ref<HTMLAudioElement | null>(null)
const playing = ref(false)

async function playAudio() {
  if (!player.value) return
  try {
    await player.value.play()
    playing.value = true
  }
  catch {
    playing.value = false
  }
}

async function toggle() {
  if (!player.value) return
  if (playing.value) {
    player.value.pause()
    return
  }
  await playAudio()
}

function selectChoice(value: AudioChoice) {
  choice.value = value
  menuOpen.value = false
}

onMounted(() => {
  if (autoplay.value) void playAudio()
})
watch(src, () => {
  playing.value = false
  if (autoplay.value) void nextTick(playAudio)
})
watch(autoplay, (enabled) => {
  if (!enabled) player.value?.pause()
})
</script>

<style scoped>
.card-audio {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: flex-start;
  margin-top: var(--space-2);
}

.card-audio-voice-picker {
  position: relative;
}

.card-audio-voice-trigger,
.card-audio-voice-option {
  display: inline-flex;
  width: var(--size-touch);
  height: var(--size-touch);
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--text-lg);
  cursor: pointer;
}

.card-audio-voice-trigger:hover,
.card-audio-voice-option:hover,
.card-audio-voice-option-selected {
  border-color: var(--color-accent);
  background: var(--color-surface-muted);
}

.card-audio-voice-menu {
  position: absolute;
  z-index: 1;
  bottom: calc(100% + var(--space-2));
  left: 0;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.card-audio-player {
  display: none;
}
</style>
