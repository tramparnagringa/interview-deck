import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils/module',
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
      // Trampar na Gringa mark. The .ico is the fallback for browsers without SVG favicons.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      skool: {
        // NUXT_PUBLIC_SKOOL_URL: the community. NUXT_PUBLIC_SKOOL_PLANS_URL: the plans page (upgrade to Premium).
        url: '',
        plansUrl: '',
      },
      // NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY: the project's URL and publishable (anon) key.
      // Public by design: what a signed-in account can read is decided by RLS (supabase/migrations).
      supabase: {
        url: '',
        key: '',
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
    // Static site: icons are bundled, no icon API at runtime.
    clientBundle: { scan: true },
    serverBundle: { collections: ['lucide'] },
  },
})
