<template>
  <footer class="cta-skool">
    <UiCallout
      :href="cta.href"
      :lead="cta.text.lead"
      :icon="cta.icon"
    >
      {{ cta.text.body }}
    </UiCallout>
  </footer>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
import { shortUrl } from '~/utils/url'

/**
 * The only way to link to Skool from a screen: one per screen, in the footer (PRD 6.1).
 * Free always sells the upgrade (the plans page); Premium invites to share answers in the community.
 */
const props = defineProps<{ context: 'home' | 'card' }>()

const skool = useSkoolLinks()
const { level } = useLevel()

const cta = computed(() => {
  if (level.value === 'premium') {
    return {
      href: skool.community,
      text: { lead: copy.cta.share.lead, body: copy.cta.share.body(shortUrl(skool.community)) },
      icon: 'lucide:message-circle',
    }
  }
  return { href: skool.plans, text: copy.cta[props.context], icon: 'lucide:sparkle' }
})
</script>

<style scoped>
.cta-skool {
  margin-top: auto;
  padding-top: var(--space-6);
}
</style>
