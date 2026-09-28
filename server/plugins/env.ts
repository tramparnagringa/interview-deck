import { z } from 'zod'

const nonEmpty = z.string().min(1)

/** Fails fast at boot when required server config is missing (AGENTS.md: validate env with Zod). */
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  const schema = z.object({
    supabaseUrl: nonEmpty,
    supabaseKey: nonEmpty,
    supabaseSecretKey: nonEmpty,
    skool: z.object({ freeUrl: z.string().url(), premiumUrl: z.string().url(), liveUrl: z.string().url() }),
    ai: config.ai.mock
      ? z.object({})
      : z.object({ elevenlabsKey: nonEmpty, anthropicKey: nonEmpty, anthropicModel: nonEmpty, elevenlabsModel: nonEmpty }),
  })

  const result = schema.safeParse({
    supabaseUrl: config.public.supabase.url,
    supabaseKey: config.public.supabase.key,
    supabaseSecretKey: config.supabase.secretKey ?? config.supabase.serviceKey,
    skool: config.public.skool,
    ai: config.ai,
  })

  if (!result.success) {
    const message = `[env] Invalid configuration. See .env.example.\n${z.prettifyError(result.error)}`
    if (import.meta.dev) console.warn(message)
    else throw new Error(message)
  }
})
