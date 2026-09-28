/** Skool URLs from runtimeConfig (env NUXT_PUBLIC_SKOOL_*). Never hardcoded. */
export function useSkoolLinks() {
  const { skool } = useRuntimeConfig().public
  return {
    free: skool.freeUrl,
    premium: skool.premiumUrl,
    live: skool.liveUrl,
  }
}
