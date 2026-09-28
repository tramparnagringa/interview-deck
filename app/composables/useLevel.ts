import { LEVEL_FEATURES, levelSchema } from '#shared/schemas/deck'

/**
 * Access level of the current page (`definePageMeta({ level: 'premium' })`), what it unlocks, and
 * the base path of its pages. Same screens on every level; only how they are mounted changes.
 */
export function useLevel() {
  const route = useRoute()
  const level = computed(() => levelSchema.catch('free').parse(route.meta.level))
  return {
    level,
    features: computed(() => LEVEL_FEATURES[level.value]),
    /** '' for Free (`/play/…`), '/premium' for Premium (`/premium/play/…`). */
    basePath: computed(() => (level.value === 'free' ? '' : `/${level.value}`)),
  }
}
