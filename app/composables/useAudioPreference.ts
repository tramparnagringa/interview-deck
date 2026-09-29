import type { AudioVoice } from '~/utils/audio'

export type AudioChoice = AudioVoice | 'off'

/** Voice and autoplay preference for the current browser session. It resets on reload. */
export function useAudioPreference() {
  const choice = useState<AudioChoice>('practice-audio-choice', () => 'hale-v3-expressive')
  const autoplay = computed(() => choice.value !== 'off')
  const voice = computed<AudioVoice>(() => choice.value === 'off' ? DEFAULT_AUDIO_VOICE : choice.value)

  return { choice, autoplay, voice }
}
