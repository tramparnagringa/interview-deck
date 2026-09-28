import { z } from 'zod'

export const planSchema = z.enum(['free', 'premium'])
export type Plan = z.infer<typeof planSchema>

export const meSchema = z.object({
  plan: planSchema,
  email: z.string().email().nullable(),
  isAnonymous: z.boolean(),
})

export type Me = z.infer<typeof meSchema>
