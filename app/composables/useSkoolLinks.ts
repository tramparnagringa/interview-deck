/**
 * Skool links from runtimeConfig. Never hardcoded.
 * - community (env NUXT_PUBLIC_SKOOL_URL): where members share and get feedback;
 * - plans (env NUXT_PUBLIC_SKOOL_PLANS_URL): where Free users upgrade to Premium.
 */
export function useSkoolLinks() {
  const { skool } = useRuntimeConfig().public
  return { community: skool.url, plans: skool.plansUrl }
}
