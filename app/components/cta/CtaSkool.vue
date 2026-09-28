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

/**
 * The only way to link to Skool from a screen: one per screen, in the footer (PRD 6.1).
 * Free sells Premium; Premium points to the live practice rooms.
 */
const props = defineProps<{ context: 'home' | 'card' }>()

const skool = useSkoolLinks()
const { level } = useLevel()

const cta = computed(() => {
  if (level.value === 'premium') return { href: skool, text: copy.cta.live, icon: 'lucide:users' }
  return {
    href: skool,
    text: copy.cta[props.context],
    icon: props.context === 'card' ? 'lucide:circle-help' : 'lucide:sparkle',
  }
})
</script>

<style scoped>
.cta-skool {
  margin-top: auto;
  padding-top: var(--space-6);
}
</style>
