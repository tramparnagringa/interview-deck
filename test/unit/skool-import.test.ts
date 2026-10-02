import { describe, expect, it } from 'vitest'
// @ts-expect-error plain .mjs script, no type declarations
import { allowlistFromCsv, parseCsv } from '../../scripts/skool-import.mjs'

const HEADER = 'FirstName,LastName,Email,Invited By,JoinedDate,Question1,Answer1,Question2,Answer2,Question3,Answer3,Price,Recurring Interval,Tier,LTV'
const row = (email: string, answer: string, tier: string) =>
  `Ana,Lima,${email},,2026-09-30 23:54:33,"Qual a sua área de atuação, tempo de experiência e nível de Inglês? ","Dev, 5 anos, ""fluente""",Qual dessas situações?,"Chego em entrevistas finais, mas não passo",Qual é o seu e-mail?,${answer},$10,month,${tier},$10`

describe('skool import', () => {
  it('parses quoted fields with commas and escaped quotes', () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\n')).toEqual([['a', 'b, c', 'say "hi"'], ['1', '2', '3']])
  })

  it('keeps premium and vip members, never standard', () => {
    const csv = [HEADER, row('p@x.com', 'p@x.com', 'premium'), row('v@x.com', 'v@x.com', 'vip'), row('s@x.com', 's@x.com', 'standard')].join('\n')
    expect(allowlistFromCsv(csv).entries).toEqual([{ email: 'p@x.com', tier: 'premium' }, { email: 'v@x.com', tier: 'vip' }])
  })

  it('also lists the email answered in the join questions, lowercased', () => {
    const csv = [HEADER, row('Debora.Coach@x.com', 'debora.ux@x.com', 'premium')].join('\n')
    expect(allowlistFromCsv(csv).entries.map((entry: { email: string }) => entry.email)).toEqual(['debora.coach@x.com', 'debora.ux@x.com'])
  })

  it('keeps the higher tier when an email appears twice', () => {
    const csv = [HEADER, row('a@x.com', 'a@x.com', 'premium'), row('b@x.com', 'a@x.com', 'vip')].join('\n')
    expect(allowlistFromCsv(csv).entries).toContainEqual({ email: 'a@x.com', tier: 'vip' })
  })

  it('skips invalid emails and refuses files that are not a Skool export', () => {
    expect(allowlistFromCsv([HEADER, row('', 'not an email', 'vip')].join('\n'))).toEqual({ entries: [], skipped: 1 })
    expect(() => allowlistFromCsv('name,email\nAna,a@x.com')).toThrow('not a Skool members export')
  })
})
