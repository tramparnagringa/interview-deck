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
      :href="skool.community"
    >
      {{ copy.menu.community }}
    </UiMenuItem>
    <UiMenuItem
      icon="lucide:log-out"
      @click="signOut"
    >
      {{ copy.menu.signOut }}
    </UiMenuItem>
  </UiMenu>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

const skool = useSkoolLinks()

async function signOut() {
  await useNuxtApp().$supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
