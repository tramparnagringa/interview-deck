import type { Me } from '#shared/schemas/plan'

export default defineEventHandler(async (event): Promise<Me> => {
  const viewer = await getViewer(event)
  return { plan: viewer.plan, email: viewer.email, isAnonymous: viewer.isAnonymous }
})
