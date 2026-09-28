import { defineNuxtModule } from '@nuxt/kit'
import { z } from 'zod'

const linksSchema = z.object({
  NUXT_PUBLIC_SKOOL_URL: z.string().url(),
})

/**
 * Skool links are baked into the static site, so they must be set when it is built
 * (AGENTS.md: links come from env, validated with Zod). Warns in dev, fails the build.
 */
export default defineNuxtModule({
  meta: { name: 'skool-links' },
  setup(_, nuxt) {
    if (nuxt.options._prepare || nuxt.options.test) return
    const result = linksSchema.safeParse(process.env)
    if (result.success) return
    const message = `[skool-links] Missing or invalid Skool links. Copy .env.example to .env.\n${z.prettifyError(result.error)}`
    if (nuxt.options.dev) console.warn(message)
    else throw new Error(message)
  },
})
