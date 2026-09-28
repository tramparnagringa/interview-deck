import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '../types/database'

/** Service-role client (bypasses RLS). Server only; the key never reaches the browser. */
export function useAdminDb(event: H3Event) {
  return serverSupabaseServiceRole<Database>(event)
}
