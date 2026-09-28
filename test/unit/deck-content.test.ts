import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadDeckFiles, toSeedSql } from '../../scripts/deck-content'

const decks = loadDeckFiles(join(import.meta.dirname, '../../supabase/seed/decks'))

describe('deck content', () => {
  it('has exactly one free deck, the General deck', () => {
    expect(decks.filter(deck => deck.isFree).map(deck => deck.slug)).toEqual(['general'])
  })

  it('has unique slugs and questions per deck', () => {
    expect(new Set(decks.map(deck => deck.slug)).size).toBe(decks.length)
    for (const deck of decks) {
      expect(new Set(deck.cards.map(card => card.question)).size).toBe(deck.cards.length)
    }
  })

  it('every card has a hint (Premium content)', () => {
    for (const deck of decks) {
      for (const card of deck.cards) expect(card.hint, `${deck.slug}: ${card.question}`).toBeTruthy()
    }
  })

  it('escapes quotes in generated SQL', () => {
    const sql = toSeedSql([{ ...decks[0]!, cards: [{ category: 'X', question: 'What\'s up?', hint: null }] }])
    expect(sql).toContain('\'What\'\'s up?\'')
  })
})
