import { z } from 'zod'

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) })

/**
 * Checked before sending the magic link, so non-members get a clear "join on Skool" answer
 * instead of an email. The plan itself is re-checked on every request (getViewer).
 */
export default defineEventHandler(async (event): Promise<{ allowed: boolean }> => {
  const { email } = await readValidatedBody(event, bodySchema.parse)
  return { allowed: await isActivePremiumMember(event, email) }
})
