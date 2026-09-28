/**
 * Imports Premium members exported from Skool.
 *
 *   pnpm premium:import members.csv          # grant access to every email in the CSV
 *   pnpm premium:import members.csv --sync   # also revoke members missing from the CSV
 *
 * Needs NUXT_PUBLIC_SUPABASE_URL and NUXT_SUPABASE_SECRET_KEY in the environment.
 * The CSV must have an "email" column (case-insensitive header).
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const [file, ...flags] = process.argv.slice(2)
if (!file) {
  console.error('Usage: pnpm premium:import <members.csv> [--sync]')
  process.exit(1)
}

const env = z.object({
  NUXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NUXT_SUPABASE_SECRET_KEY: z.string().min(1),
}).parse(process.env)

const [header = '', ...rows] = readFileSync(file, 'utf8').split(/\r?\n/).filter(line => line.trim())
const columns = header.split(',').map(column => column.trim().replace(/^"|"$/g, '').toLowerCase())
const emailIndex = columns.indexOf('email')
if (emailIndex === -1) throw new Error('CSV has no "email" column')

const emails = [...new Set(rows
  .map(row => row.split(',')[emailIndex]?.trim().replace(/^"|"$/g, '').toLowerCase() ?? '')
  .filter(email => z.string().email().safeParse(email).success))]

const supabase = createClient(env.NUXT_PUBLIC_SUPABASE_URL, env.NUXT_SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

const { error } = await supabase
  .from('premium_members')
  .upsert(emails.map(email => ({ email, source: 'skool', revoked_at: null })), { onConflict: 'email' })
if (error) throw error
console.log(`Granted: ${emails.length}`)

if (flags.includes('--sync')) {
  const { data, error: listError } = await supabase.from('premium_members').select('email').is('revoked_at', null)
  if (listError) throw listError
  const keep = new Set(emails)
  const revoke = data.map(row => row.email as string).filter(email => !keep.has(email))
  if (revoke.length) {
    const { error: revokeError } = await supabase
      .from('premium_members')
      .update({ revoked_at: new Date().toISOString() })
      .in('email', revoke)
    if (revokeError) throw revokeError
  }
  console.log(`Revoked: ${revoke.length}`)
}
