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
  </UiMenu>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

const skool = useSkoolLinks()
</script>
