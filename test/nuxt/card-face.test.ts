import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CardFace from '~/components/card/CardFace.vue'

const base = {
  id: '6f1c2d4e-1111-4a2b-9c3d-123456789abc',
  deckSlug: 'general',
  number: 14,
  category: 'Behavioral',
  question: 'Tell me about a time you disagreed with someone on your team.',
}

describe('CardFace', () => {
  it('shows category, number and question without a hint block for Free cards', async () => {
    const wrapper = await mountSuspended(CardFace, { props: { card: base } })
    expect(wrapper.get('h1').text()).toBe(base.question)
    expect(wrapper.text()).toContain('Behavioral')
    expect(wrapper.text()).toContain('No. 14')
    expect(wrapper.find('aside').exists()).toBe(false)
  })

  it('shows the hint for Premium cards', async () => {
    const wrapper = await mountSuspended(CardFace, { props: { card: { ...base, hint: 'Use STAR.' } } })
    expect(wrapper.get('aside').text()).toContain('Use STAR.')
  })
})
