import { createClient, type Session } from '@supabase/supabase-js'

/**
 * Supabase in the browser: the session (sign in with Google) and whether the account is Premium.
 * It runs before the first route is resolved, so the access middleware already knows the viewer.
 */
export default defineNuxtPlugin(async () => {
  const { supabase: config } = useRuntimeConfig().public
  const supabase = createClient(config.url, config.key, {
    // PKCE: Google sends the viewer back to /login?code=…, exchanged here for a session.
    auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  })
  const viewer = useViewer()

  async function load(session: Session | null) {
    let premium = false
    if (session) {
      const { data, error } = await supabase.rpc('is_premium')
      // If the check fails the viewer gets the Free pages; the next visit checks again.
      premium = !error && data === true
    }
    viewer.value = { signedIn: Boolean(session), premium, email: session?.user.email ?? null, ready: true }
  }

  const { data } = await supabase.auth.getSession()
  await load(data.session)

  supabase.auth.onAuthStateChange((event) => {
    // Supabase warns against awaiting its own calls inside this callback: only update the state.
    if (event === 'SIGNED_OUT') viewer.value = { signedIn: false, premium: false, email: null, ready: true }
  })

  return { provide: { supabase } }
})
