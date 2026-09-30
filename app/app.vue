<script setup lang="ts">
const appConfig = useAppConfig()
useHead({ htmlAttrs: { 'data-theme': () => appConfig.theme } })
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
