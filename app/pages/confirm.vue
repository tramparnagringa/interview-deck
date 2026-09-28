<template>
  <main class="confirm">
    <AppNotice
      v-if="failed"
      :message="copy.login.confirmError"
      :action-label="copy.login.title"
      action-to="/login"
    />
    <p
      v-else
      class="confirm-text"
      role="status"
    >
      {{ copy.login.confirming }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'

/** Magic-link landing page. The Supabase client exchanges the code in the URL for a session. */
const CONFIRM_TIMEOUT_MS = 10_000

const user = useSupabaseUser()
const { refresh } = usePlan()
const practice = usePracticeStore()
const failed = ref(false)

let timeout: ReturnType<typeof setTimeout> | undefined

watch(user, async (value) => {
  if (!value || value.is_anonymous) return
  clearTimeout(timeout)
  practice.reset()
  await refresh()
  await refreshNuxtData('decks')
  await navigateTo('/', { replace: true })
}, { immediate: true })

onMounted(() => {
  timeout = setTimeout(() => {
    failed.value = true
  }, CONFIRM_TIMEOUT_MS)
})
onBeforeUnmount(() => clearTimeout(timeout))
</script>

<style scoped>
.confirm {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.confirm-text {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}
</style>
