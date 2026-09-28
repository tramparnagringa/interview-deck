<template>
  <main class="login">
    <CardTopBar
      :close-label="copy.login.back"
      close-to="/"
    />
    <h1 class="login-title">
      {{ copy.login.title }}
    </h1>
    <p class="login-intro">
      {{ copy.login.intro }}
    </p>

    <p
      v-if="sentTo"
      class="login-message"
      role="status"
    >
      {{ copy.login.sent(sentTo) }}
    </p>

    <form
      v-else
      class="login-form"
      novalidate
      @submit.prevent="submit"
    >
      <UiTextField
        v-model="email"
        :label="copy.login.email"
        type="email"
        name="email"
        autocomplete="email"
        :placeholder="copy.login.placeholder"
        required
        :error="error ?? undefined"
      />
      <UiButton
        type="submit"
        block
        :loading="sending"
      >
        {{ copy.login.submit }}
      </UiButton>
    </form>

    <CtaSkool context="login" />
  </main>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { copy } from '~/content/copy'

const supabase = useSupabaseClient()
const email = ref('')
const sending = ref(false)
const error = ref<string | null>(null)
const sentTo = ref<string | null>(null)

async function submit() {
  const address = email.value.trim().toLowerCase()
  if (!z.string().email().safeParse(address).success) {
    error.value = copy.login.error
    return
  }
  sending.value = true
  error.value = null
  try {
    const { allowed } = await $fetch<{ allowed: boolean }>('/api/auth/premium-check', {
      method: 'POST',
      body: { email: address },
    })
    if (!allowed) {
      error.value = copy.login.notMember
      return
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/confirm`, shouldCreateUser: true },
    })
    if (otpError) throw otpError
    sentTo.value = address
  }
  catch {
    error.value = copy.login.error
  }
  finally {
    sending.value = false
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-5);
}

.login-title {
  margin: var(--space-6) 0 0;
  font-size: var(--text-title);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.login-intro,
.login-message {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
