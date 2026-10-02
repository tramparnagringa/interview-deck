import { defineNuxtModule } from '@nuxt/kit'
import { z } from 'zod'

const publicEnvSchema = z.object({
  NUXT_PUBLIC_SKOOL_URL: z.string().url(),
  NUXT_PUBLIC_SKOOL_PLANS_URL: z.string().url(),
  NUXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NUXT_PUBLIC_SUPABASE_KEY: z.string().min(1),
})

/**
 * Public settings (Skool links, Supabase project) are baked into the static site, so they must be
 * set when it is built (AGENTS.md: env validated with Zod). Warns in dev, fails the build.
 */
export default defineNuxtModule({
  meta: { name: 'public-env' },
  setup(_, nuxt) {
    if (nuxt.options._prepare || nuxt.options.test) return
    const result = publicEnvSchema.safeParse(process.env)
    if (result.success) return
    const message = `[public-env] Missing or invalid public settings. Copy .env.example to .env.\n${z.prettifyError(result.error)}`
    if (nuxt.options.dev) console.warn(message)
    else throw new Error(message)
  },
})
