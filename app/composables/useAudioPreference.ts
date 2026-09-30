import { AUDIO_VOICES, type AudioVoice } from '~/utils/audio'

export type AudioChoice = AudioVoice | 'off'

/**
 * Voice and autoplay preference, remembered across visits.
 * Levels without the voice picker always play the main voice.
 */
export function useAudioPreference() {
  const { features } = useLevel()
  const isChoice = (value: unknown): value is AudioChoice => value === 'off' || AUDIO_VOICES.includes(value as AudioVoice)
  const picked = useStoredState<AudioChoice>('practice-audio-choice', () => DEFAULT_AUDIO_VOICE, isChoice)
  const choice = computed<AudioChoice>({
    get: () => (features.value.voicePicker ? picked.value : DEFAULT_AUDIO_VOICE),
    set: (value) => { picked.value = value },
  })
  const autoplay = computed(() => choice.value !== 'off')
  const voice = computed<AudioVoice>(() => choice.value === 'off' ? DEFAULT_AUDIO_VOICE : choice.value)

  return { choice, autoplay, voice }
}
