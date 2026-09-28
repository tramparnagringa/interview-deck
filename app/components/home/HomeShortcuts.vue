<template>
  <nav
    class="home-shortcuts"
    :aria-label="copy.home.practiceAi.title"
  >
    <UiActionTile
      :title="copy.home.practiceAi.title"
      :subtitle="copy.home.practiceAi.subtitle"
      icon="lucide:sparkle"
      icon-tone="accent"
      :to="aiTo"
    />
    <UiActionTile
      :title="copy.home.practicePeople.title"
      :subtitle="copy.home.practicePeople.subtitle"
      icon="lucide:users"
      :href="skool.live"
    />
  </nav>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** Premium Home shortcuts (screen 04). "Practice with people" opens the live rooms on Skool. */
const props = defineProps<{ deckSlug: string }>()

const skool = useSkoolLinks()
const aiTo = computed(() => `/play/${props.deckSlug}?shuffle=1`)
</script>

<style scoped>
.home-shortcuts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
</style>
