// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import interviewDeck from './eslint/interview-deck-plugin.mjs'

export default withNuxt(
  {
    ignores: ['supabase/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    // Product components, pages and layouts: semantic classes + tokens only (AGENTS.md).
    files: ['app/**/*.vue'],
    ignores: ['app/components/ui/**'],
    plugins: { 'interview-deck': interviewDeck },
    rules: {
      'interview-deck/semantic-classes-only': 'error',
      'interview-deck/tokens-only-in-style': 'error',
    },
  },
  {
    // Primitives may use Tailwind, but colors and sizes still come from tokens.
    files: ['app/components/ui/**/*.vue'],
    plugins: { 'interview-deck': interviewDeck },
    rules: {
      'interview-deck/tokens-only-in-style': 'error',
    },
  },
)
