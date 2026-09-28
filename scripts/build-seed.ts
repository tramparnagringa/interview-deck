import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadDeckFiles, toSeedSql } from './deck-content'

const root = join(import.meta.dirname, '..', 'supabase', 'seed')
const decks = loadDeckFiles(join(root, 'decks'))
writeFileSync(join(root, 'seed.sql'), toSeedSql(decks))
console.log(`seed.sql: ${decks.length} decks, ${decks.reduce((sum, deck) => sum + deck.cards.length, 0)} cards`)
