import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils/module',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Interview Deck',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Pick a card. Answer out loud. Get better.' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    ai: {
      mock: false,
      elevenlabsKey: '',
      anthropicKey: '',
      anthropicModel: 'claude-sonnet-5',
      elevenlabsModel: 'scribe_v2',
    },
    public: {
      skool: {
        freeUrl: '',
        premiumUrl: '',
        liveUrl: '',
      },
    },
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fonts: {
    families: [{ name: 'Figtree', provider: 'google', weights: [400, 500, 600, 700] }],
  },

  icon: {
    serverBundle: { collections: ['lucide'] },
  },

  supabase: {
    // Auth is anonymous by default; pages never force a login.
    redirect: false,
    types: false,
  },
})
