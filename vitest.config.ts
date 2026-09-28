import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Component tests never reach Supabase, but the module needs a URL and key to boot.
process.env.NUXT_PUBLIC_SUPABASE_URL ||= 'http://127.0.0.1:54321'
process.env.NUXT_PUBLIC_SUPABASE_KEY ||= 'test-publishable-key'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: { nuxt: { domEnvironment: 'happy-dom' } },
        },
      }),
    ],
  },
})
