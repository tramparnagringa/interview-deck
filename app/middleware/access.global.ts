import { redirectFor, safeNext } from '~/utils/access'

/**
 * Sign-in wall and Free/Premium pages (rules in utils/access.ts). Browser only: the site is
 * prerendered without a session, and protected pages render only in the browser (layouts/default.vue).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const target = redirectFor(to.path, to.fullPath, useViewer().value, safeNext(to.query.next))
  if (target !== null && target !== to.fullPath) return navigateTo(target, { replace: true })
})
