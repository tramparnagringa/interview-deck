<template>
  <NuxtLayout>
    <main class="error-page">
      <AppNotice
        :message="error.statusCode === 404 ? copy.errors.notFound : copy.errors.generic"
        :action-label="copy.errors.home"
        @action="clearError({ redirect: '/' })"
      />
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { copy } from '~/content/copy'

defineProps<{ error: NuxtError }>()
</script>

<style scoped>
.error-page {
  display: flex;
  flex: 1;
}
</style>
