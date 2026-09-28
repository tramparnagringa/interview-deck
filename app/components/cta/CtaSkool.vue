<template>
  <footer
    v-if="!isPremium"
    class="cta-skool"
  >
    <UiCallout
      :href="href"
      :lead="text.lead"
      :icon="icon"
    >
      {{ text.body }}
    </UiCallout>
  </footer>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

export type CtaContext = keyof typeof copy.cta

/** The only way to link to Skool from a screen: one per screen, in the footer (PRD 6.1). Hidden for Premium. */
const props = defineProps<{ context: CtaContext }>()

const { isPremium } = usePlan()
const skool = useSkoolLinks()

const text = computed(() => copy.cta[props.context])
const href = computed(() => skool.premium)
const icon = computed(() => (props.context === 'card' ? 'lucide:circle-help' : props.context === 'locked' || props.context === 'lockedDeck' ? 'lucide:lock' : 'lucide:sparkle'))
</script>

<style scoped>
.cta-skool {
  margin-top: auto;
  padding-top: var(--space-6);
}
</style>
