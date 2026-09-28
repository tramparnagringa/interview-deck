import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiButton from '~/components/ui/UiButton.vue'
import UiScoreBar from '~/components/ui/UiScoreBar.vue'
import UiProgressRing from '~/components/ui/UiProgressRing.vue'
import UiHighlight from '~/components/ui/UiHighlight.vue'
import UiIconButton from '~/components/ui/UiIconButton.vue'

describe('UiButton', () => {
  it('renders a button by default and emits clicks', async () => {
    const onClick = vi.fn()
    const wrapper = await mountSuspended(UiButton, { attrs: { onClick }, slots: { default: () => 'Shuffle & draw' } })
    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toContain('Shuffle & draw')
    await button.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders an external link that opens in a new tab', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { href: 'https://example.com' },
      slots: { default: () => 'Go' },
    })
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('https://example.com')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
  })

  it('is disabled and busy while loading', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { loading: true }, slots: { default: () => 'Send' } })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
  })
})

describe('UiIconButton', () => {
  it('has an accessible name', async () => {
    const wrapper = await mountSuspended(UiIconButton, { props: { icon: 'lucide:x', label: 'Close' } })
    expect(wrapper.get('button').attributes('aria-label')).toBe('Close')
  })
})

describe('UiScoreBar', () => {
  it('fills as many segments as the score and exposes it as a meter', async () => {
    const wrapper = await mountSuspended(UiScoreBar, { props: { label: 'Structure', value: 4, note: 'Clear STAR' } })
    const meter = wrapper.get('[role="meter"]')
    expect(meter.attributes('aria-valuenow')).toBe('4')
    expect(meter.attributes('aria-valuemax')).toBe('5')
    expect(meter.findAll('span')).toHaveLength(5)
    expect(meter.findAll('span.bg-accent')).toHaveLength(4)
    expect(wrapper.text()).toContain('Clear STAR')
  })
})

describe('UiProgressRing', () => {
  it('maps progress to the stroke offset and clamps it', async () => {
    const full = await mountSuspended(UiProgressRing, { props: { progress: 1 } })
    const empty = await mountSuspended(UiProgressRing, { props: { progress: -1 } })
    expect(Number(full.findAll('circle')[1]!.attributes('stroke-dashoffset'))).toBe(0)
    const dash = Number(empty.findAll('circle')[1]!.attributes('stroke-dasharray'))
    expect(Number(empty.findAll('circle')[1]!.attributes('stroke-dashoffset'))).toBeCloseTo(dash)
  })
})

describe('UiHighlight', () => {
  it('marks whole words only, case-insensitively', async () => {
    const wrapper = await mountSuspended(UiHighlight, {
      props: { text: 'so we set up a call, and We agreed on the weekend', marks: ['we'] },
    })
    const marks = wrapper.findAll('mark').map(mark => mark.text())
    expect(marks).toEqual(['we', 'We'])
    expect(wrapper.text()).toBe('so we set up a call, and We agreed on the weekend')
  })

  it('escapes regex characters in marks', async () => {
    const wrapper = await mountSuspended(UiHighlight, { props: { text: 'a (b) c', marks: ['(b'] } })
    expect(wrapper.text()).toBe('a (b) c')
  })
})
