import { relative, resolve } from 'node:path'
import { addTemplate, defineNuxtModule, updateTemplates } from '@nuxt/kit'
import { loadDeckFiles, loadStageFiles, toDeckData, toPremiumContent } from './content'

/**
 * Turns app/content (decks/*.json and stages/*.json) into two build files:
 * - `#build/decks`: decks and shared stages, without Premium content (every page imports it);
 * - `#build/premium`: hints and example answers by card id, imported lazily and only by Premium pages.
 * The JSON files themselves are never imported by the app.
 */
export default defineNuxtModule({
  meta: { name: 'decks' },
  setup(_, nuxt) {
    const contentDir = resolve(nuxt.options.srcDir, 'content')
    const loadFiles = () => ({
      decks: loadDeckFiles(resolve(contentDir, 'decks')),
      stages: loadStageFiles(resolve(contentDir, 'stages')),
    })

    addTemplate({
      filename: 'decks.ts',
      write: true,
      getContents: () => {
        const { decks, stages } = loadFiles()
        return [
          'import type { DeckData } from \'../shared/schemas/deck\'',
          '',
          `const data: DeckData = ${JSON.stringify(toDeckData(decks, stages), null, 2)}`,
          '',
          'export default data',
          '',
        ].join('\n')
      },
    })

    addTemplate({
      filename: 'premium.ts',
      write: true,
      getContents: () => {
        const { decks, stages } = loadFiles()
        return [
          '// Premium content. Only import this with a dynamic import() from Premium pages.',
          'import type { PremiumContent } from \'../shared/schemas/deck\'',
          '',
          `const premium: Record<string, PremiumContent> = ${JSON.stringify(toPremiumContent(decks, stages), null, 2)}`,
          '',
          'export default premium',
          '',
        ].join('\n')
      },
    })

    // Static site: prerender every page, for both levels.
    nuxt.hook('nitro:config', (config) => {
      const slugs = loadFiles().decks.map(deck => deck.slug)
      config.prerender ||= {}
      config.prerender.routes = [
        ...(config.prerender.routes ?? []),
        '/',
        '/about',
        '/premium',
        ...slugs.flatMap(slug => [`/play/${slug}`, `/premium/play/${slug}`, `/premium/mock/${slug}`]),
      ]
    })

    nuxt.hook('builder:watch', async (_event, path) => {
      if (relative(contentDir, resolve(nuxt.options.srcDir, path)).startsWith('..')) return
      await updateTemplates({ filter: template => ['decks.ts', 'premium.ts'].includes(template.filename) })
    })
  },
})
