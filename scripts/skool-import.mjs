// Imports the Skool members export into the Premium allowlist (docs/AUTH.md).
//
//   pnpm skool:import                 newest community_members*.csv in ~/Downloads
//   pnpm skool:import path/to.csv     a specific export
//   pnpm skool:import --dry-run       show what would be imported, change nothing
//
// Needs NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (secret / service_role key) in .env.
// The export has personal data: keep it out of the repository.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Skool tiers, lowest to highest: each includes the one before. Premium in the app = premium and up. */
export const SKOOL_TIERS = ['standard', 'premium', 'vip']
export const PREMIUM_TIERS = SKOOL_TIERS.slice(SKOOL_TIERS.indexOf('premium'))

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Minimal CSV parser (quoted fields, escaped quotes, commas and newlines inside quotes). */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      }
      else if (char === '"') quoted = false
      else field += char
    }
    else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    }
    else field += char
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter(r => r.some(cell => cell.trim()))
}

/**
 * Premium entries from a Skool export: the account email, plus the email answered in the join
 * questions when it differs (people often answer with another address). Higher tier wins.
 */
export function allowlistFromCsv(text) {
  const [header, ...rows] = parseCsv(text)
  if (!header) throw new Error('The file is empty.')
  const column = name => header.findIndex(cell => cell.trim().toLowerCase() === name)
  const emailColumn = column('email')
  const tierColumn = column('tier')
  if (emailColumn < 0 || tierColumn < 0) throw new Error('This is not a Skool members export (no Email or Tier column).')

  const byEmail = new Map()
  let skipped = 0
  for (const row of rows) {
    const tier = (row[tierColumn] ?? '').trim().toLowerCase()
    if (!PREMIUM_TIERS.includes(tier)) continue
    // Answers to a join question about the email ("Qual é o seu e-mail?").
    const answered = header.flatMap((cell, index) =>
      /^question\d+$/i.test(cell.trim()) && /e-?mail/i.test(row[index] ?? '') ? [row[index + 1] ?? ''] : [])
    const emails = [row[emailColumn] ?? '', ...answered].map(email => email.trim().toLowerCase()).filter(email => EMAIL.test(email))
    if (emails.length === 0) skipped++
    for (const email of emails) {
      const current = byEmail.get(email)
      if (!current || SKOOL_TIERS.indexOf(tier) > SKOOL_TIERS.indexOf(current)) byEmail.set(email, tier)
    }
  }
  const entries = [...byEmail].map(([email, tier]) => ({ email, tier })).sort((a, b) => a.email.localeCompare(b.email))
  return { entries, skipped }
}

/** The newest Skool export in ~/Downloads. */
function newestExport() {
  const folder = join(homedir(), 'Downloads')
  const files = readdirSync(folder)
    .filter(name => /^community_members.*\.csv$/i.test(name))
    .map(name => join(folder, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  if (!files[0]) throw new Error(`No community_members*.csv in ${folder}. Export the members on Skool, or pass the file path.`)
  return files[0]
}

async function main(args) {
  const dryRun = args.includes('--dry-run')
  const file = args.find(arg => !arg.startsWith('--')) ?? newestExport()
  const { entries, skipped } = allowlistFromCsv(readFileSync(file, 'utf8'))
  const count = tier => entries.filter(entry => entry.tier === tier).length
  console.log(`File: ${file}`)
  console.log(`Premium emails: ${entries.length} (premium ${count('premium')}, vip ${count('vip')})${skipped ? `, ${skipped} member(s) without a valid email skipped` : ''}`)
  if (entries.length === 0) throw new Error('No premium or vip members in this file: nothing imported.')
  if (dryRun) {
    console.log('Dry run: nothing changed.')
    return
  }

  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Set NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env (Supabase → Settings → API keys → secret key).')
  const response = await fetch(`${url}/rest/v1/rpc/replace_premium_allowlist`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries }),
  })
  if (!response.ok) throw new Error(`Supabase refused the import (${response.status}): ${await response.text()}`)
  console.log(`Imported: ${await response.json()} emails. The previous Skool list was replaced.`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
