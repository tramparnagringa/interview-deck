/** Skool URL from runtimeConfig (env NUXT_PUBLIC_SKOOL_URL). Never hardcoded. */
export function useSkoolLinks() {
  const { skool } = useRuntimeConfig().public
  return skool.url
}
