import type { Me } from '#shared/schemas/plan'

const ANONYMOUS: Me = { plan: 'free', email: null, isAnonymous: true }

/** Current plan as decided by the server (`/api/me`). Shared across components. */
export function usePlan() {
  const { data, refresh, status } = useFetch<Me>('/api/me', { key: 'me' })
  const me = computed<Me>(() => data.value ?? ANONYMOUS)
  return {
    me,
    isPremium: computed(() => me.value.plan === 'premium'),
    status,
    refresh,
  }
}
