<template>
  <main class="login">
    <AppLogo />
    <div class="login-body">
      <h1 class="login-title">
        {{ copy.login.title }}
      </h1>
      <p class="login-intro">
        {{ copy.login.intro }}
      </p>

      <div
        v-if="inApp"
        class="login-in-app"
        role="alert"
      >
        <p class="login-in-app-text">
          {{ copy.login.inApp }}
        </p>
        <UiButton
          variant="secondary"
          icon="lucide:copy"
          block
          @click="copyLink"
        >
          {{ copied ? copy.login.copied : copy.login.copyLink }}
        </UiButton>
      </div>

      <UiButton
        v-else
        icon="lucide:log-in"
        block
        :loading="redirecting"
        @click="signIn"
      >
        {{ copy.login.google }}
      </UiButton>

      <p
        v-if="failed"
        class="login-error"
        role="alert"
      >
        {{ copy.login.error }}
      </p>
      <p class="login-privacy">
        {{ copy.login.privacy }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { copy } from '~/content/copy'
import { safeNext } from '~/utils/access'
import { isInAppBrowser } from '~/utils/browser'

/**
 * Sign in with Google. Everything but /about needs an account (middleware/access.global.ts);
 * Google sends the viewer back here with a code, and the middleware then takes them on.
 */
const route = useRoute()
const redirecting = ref(false)
const failed = ref(Boolean(route.query.error))
// Checked after mounting: the page is prerendered, and the server doesn't know the browser.
const inApp = ref(false)
const copied = ref(false)

onMounted(() => {
  inApp.value = isInAppBrowser(navigator.userAgent)
})

async function signIn() {
  redirecting.value = true
  failed.value = false
  const next = safeNext(route.query.next)
  const { error } = await useNuxtApp().$supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login${next ? `?next=${encodeURIComponent(next)}` : ''}` },
  })
  if (error) {
    redirecting.value = false
    failed.value = true
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
  }
  catch {
    // Clipboard blocked: the address bar still has the link.
  }
}

useHead({ title: copy.brand.name })
</script>

<style scoped>
.login {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.login-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-5);
  padding-block: var(--space-10);
}

.login-title {
  margin: 0;
  font-size: var(--text-title);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.login-intro {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}

.login-in-app {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.login-in-app-text {
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-inner);
  background: var(--color-highlight);
}

.login-error {
  margin: 0;
  color: var(--color-danger);
}

.login-privacy {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
}
</style>
