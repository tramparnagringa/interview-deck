import type { AudioVoice } from '~/utils/audio'

export type AudioChoice = AudioVoice | 'off'

/**
 * Voice and autoplay preference for the current browser session. It resets on reload.
 * Levels without the voice picker always play the main voice.
 */
export function useAudioPreference() {
  const { features } = useLevel()
  const picked = useState<AudioChoice>('practice-audio-choice', () => DEFAULT_AUDIO_VOICE)
  const choice = computed<AudioChoice>({
    get: () => (features.value.voicePicker ? picked.value : DEFAULT_AUDIO_VOICE),
    set: (value) => { picked.value = value },
  })
  const autoplay = computed(() => choice.value !== 'off')
  const voice = computed<AudioVoice>(() => choice.value === 'off' ? DEFAULT_AUDIO_VOICE : choice.value)

  return { choice, autoplay, voice }
}
