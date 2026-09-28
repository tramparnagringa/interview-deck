/**
 * Free works without sign-up: create an invisible anonymous Supabase user on the first visit,
 * so the server can count free AI feedback per user (ARCHITECTURE D5).
 */
export default defineNuxtPlugin({
  name: 'anon-auth',
  dependsOn: ['supabase'],
  async setup() {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    if (data.session) return
    const { error } = await supabase.auth.signInAnonymously()
    if (error) console.warn('[anon-auth] anonymous sign-in failed', error.message)
  },
})
