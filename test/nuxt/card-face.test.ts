import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Card } from '#shared/schemas/deck'
import CardFace from '~/components/card/CardFace.vue'

const card: Card = {
  id: 'general-14',
  stage: 'core',
  deckSlug: 'general',
  number: 14,
  category: 'Behavioral',
  question: 'Tell me about a time you disagreed with someone on your team.',
}

describe('CardFace', () => {
  it('shows category and question, without a number or hint block', async () => {
    const wrapper = await mountSuspended(CardFace, { props: { card } })
    expect(wrapper.get('h1').text()).toBe(card.question)
    expect(wrapper.text()).toContain('Behavioral')
    expect(wrapper.text()).not.toContain('No.')
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('aside').exists()).toBe(false)
  })

  it('shows the hint when the card has one (premium build)', async () => {
    const wrapper = await mountSuspended(CardFace, { props: { card: { ...card, hint: 'Use STAR.' } } })
    expect(wrapper.get('aside').text()).toContain('Use STAR.')
  })

  it('shows the example answer closed, so the candidate tries first', async () => {
    const wrapper = await mountSuspended(CardFace, { props: { card: { ...card, example: 'I once disagreed with…' } } })
    const details = wrapper.get('details')
    expect(details.attributes('open')).toBeUndefined()
    expect(details.get('summary').text()).toContain('See an example answer')
    expect(details.text()).toContain('I once disagreed with…')
  })

  it('does not number openers', async () => {
    const wrapper = await mountSuspended(CardFace, {
      props: { card: { ...card, id: 'opening-1', stage: 'opening', category: 'Small talk', question: 'Can you hear me okay?' } },
    })
    expect(wrapper.text()).not.toContain('No.')
  })
})
