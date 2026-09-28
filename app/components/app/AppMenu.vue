<template>
  <UiMenu :label="copy.menu.label">
    <UiMenuItem
      icon="lucide:info"
      to="/about"
    >
      {{ copy.menu.about }}
    </UiMenuItem>
    <UiMenuItem
      icon="lucide:users"
      :href="isPremium ? skool.premium : skool.free"
    >
      {{ copy.menu.community }}
    </UiMenuItem>
    <UiMenuItem
      v-if="me.isAnonymous"
      icon="lucide:log-in"
      to="/login"
    >
      {{ copy.menu.signIn }}
    </UiMenuItem>
    <UiMenuItem
      v-else
      icon="lucide:log-out"
      @click="signOut"
    >
      {{ copy.menu.signOut }}
    </UiMenuItem>
  </UiMenu>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

const { me, isPremium, refresh } = usePlan()
const skool = useSkoolLinks()
const supabase = useSupabaseClient()
const practice = usePracticeStore()

async function signOut() {
  await supabase.auth.signOut()
  // Back to an anonymous Free session, like a first visit.
  await supabase.auth.signInAnonymously()
  practice.reset()
  await refresh()
  await refreshNuxtData('decks')
  await navigateTo('/')
}
</script>
