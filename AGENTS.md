# AGENTS.md — Interview Deck

Instruções para qualquer agente de código (Claude Code, Codex, Cursor etc.) e para quem entrar no projeto.

- **O que é o produto:** [docs/interview-deck-prd/PRD.md](docs/interview-deck-prd/PRD.md) (telas de referência em `docs/interview-deck-prd/screenshots/`).
- **Decisões de arquitetura e o porquê:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Leia o PRD antes de construir qualquer tela. Em caso de conflito, o PRD manda no *o quê*; este arquivo manda no *como*.

## Fase atual: só o deck (site estático)

A primeira versão é só o baralho: tirar carta, responder com o timer, próxima carta, CTA do Skool. O Free abre só o General Deck (`FREE_DECKS`); o Premium abre todos. **Sem IA, sem banco, sem login.** O site é gerado estático (`pnpm generate`) e publicado na Vercel.

- Conteúdo: `app/content/decks/<slug>.json` (perguntas do miolo, por tema/função) e `app/content/stages/{opening,intro,closing}.json` (momentos da entrevista, comuns a todos os decks, cada um com seu timer). O módulo local `modules/decks/` valida os arquivos (Zod) e gera `#build/decks`. Nunca importe os JSON direto no app. Um teste barra pergunta repetida em qualquer arquivo.
- **Etapas:** toda sessão segue uma entrevista: opening (small talk, 30s) → intro ("Tell me about yourself"…) → core (o deck) → closing (salário, contrato, fuso, "questions for us?").
- **Modos:** treino livre (`practice`, todos os níveis) passa pelo deck inteiro e recomeça; mock interview (`mock`, só Premium, `/premium/mock/:deck`) tem opening, intro, `MOCK_CORE_QUESTIONS` perguntas e closing, e termina. Os modos de cada nível estão em `LEVEL_FEATURES`.
- Componentes auto-importados levam o nome da pasta como prefixo (`components/play/PlayMockComplete.vue` → `<PlayMockComplete>`). Nomeie o arquivo com o nome completo, senão o componente não resolve.
- **Níveis de acesso:** um app só, as mesmas telas montadas por páginas diferentes. `/` e `/play/:deck` são Free; `/premium`, `/premium/play/:deck` e `/premium/mock/:deck` montam `HomeScreen`/`PlayScreen` com `definePageMeta({ level: 'premium' })`. Quais decks cada nível vê é decidido por `isDeckAvailable()`; um deck fora do nível dá "not found". `useLevel()` dá o nível, o que ele libera (`LEVEL_FEATURES` em `shared/schemas/deck.ts`) e o `basePath` para os links. Páginas são finas: a lógica fica nas telas.
- **Conteúdo Premium:** hint e resposta modelo (`example`) ficam em `#build/premium`, um arquivo separado que só as páginas de nível Premium carregam (`import()` dinâmico no `PlayScreen`). Nunca importe `#build/premium` estaticamente. O campo `source` do JSON é editorial (ex.: `"50-questions"` = ebook da TNG) e nunca vai para o app. Limite aceito: sem login, os hints estão publicados no site e quem achar `/premium` vê.
- **Vídeo da resposta** (todos os níveis): `CardRecorder` + `useAnswerRecorder` gravam câmera e microfone no navegador e compõem um vídeo vertical (pergunta, pessoa, assinatura da TNG). Nada vai para servidor; "Save video" compartilha ou baixa o arquivo.
- A versão completa (Supabase, feedback de IA, Premium por magic link) está no branch `premium-ai`. As regras marcadas como *(premium-ai)* abaixo valem só quando ela voltar.

## Stack

- **Nuxt 4+** (Vue 3, `<script setup lang="ts">`, Composition API). Nada de Options API.
- **TypeScript** em modo strict. Sem `any` sem justificativa em comentário.
- **Tailwind CSS v4** (via `@tailwindcss/vite`), usado **só** dentro do design system (ver abaixo).
- *(premium-ai)* **Supabase** (Postgres + Auth + RLS) via `@nuxtjs/supabase`. Não está instalado nesta fase.
- **Pinia** para o estado da sessão de prática; composables para comportamento reutilizável.
- **Zod** para validar tudo que cruza fronteira (conteúdo dos decks, env; no premium-ai, body de API e resposta da IA).
- `@nuxt/fonts` (Figtree), `@nuxt/icon` (Lucide), `@nuxt/eslint`.
- **Vitest** + `@nuxt/test-utils` para unidade/componentes; **Playwright** para fluxos.
- Gerenciador de pacotes: **pnpm**.

## Estrutura de pastas

```
app/
  assets/css/main.css     # Tailwind + tokens (@theme). Única fonte de cores, fontes, raios, sombras.
  components/
    ui/                   # DESIGN SYSTEM — primitivos. Único lugar onde classes Tailwind são permitidas.
    home/                 # HomeScreen: tela inicial (Free e Premium)
    play/                 # PlayScreen (treino e mock), PlayMockComplete (fim do mock)
    deck/                 # Pilha de cartas, capa, seletor de decks
    card/                 # Carta da pergunta, timer na carta, áudio, gravador de vídeo, hint, resposta modelo, ações
    cta/                  # CTA para o Skool
    app/                  # Header, menu, logo, avisos
  composables/            # useLevel, useTimer, useCountdown, useSwipe, useKeyboardShortcuts, useAudioPreference, useAnswerRecorder, useSkoolLinks
  content/                # copy.ts (textos de UI), decks/*.json, stages/*.json
  stores/                 # Pinia: sessão de prática (deck atual, ordem da sessão, posição)
  layouts/                # default (único layout)
  pages/                  # rotas finas: montam as telas com o nível, sem lógica de negócio
  utils/                  # helpers do cliente (deck, áudio, gravação)
modules/
  decks/                  # valida os JSON e gera #build/decks e #build/premium
  skool-links.ts          # valida os links do Skool no build
shared/
  schemas/ utils/         # Schemas Zod, níveis (LEVEL_FEATURES), embaralhamento
eslint/                   # plugin com as regras de estilo do projeto
test/                     # unit/, nuxt/ (vitest) e e2e/ (playwright)
docs/
```

No branch `premium-ai` existem também `server/` (API, IA, créditos), `supabase/` (migrations e seed) e as telas de gravação de áudio e feedback de IA.

## Regra de estilo: design system vs. componentes do produto

Esta é a regra mais importante do projeto.

**1. `app/components/ui/` — design system (prefixo auto-import `Ui`)**
- Primitivos genéricos, sem conhecimento do produto: `UiButton`, `UiIconButton`, `UiChip`, `UiCallout`, `UiPlayingCard`, `UiProgressRing`, `UiScoreBar`, `UiSkeleton`…
- **Podem** usar classes Tailwind no template.
- Variações por props tipadas (`variant`, `size`, `tone`), nunca por classes passadas de fora.
- Não importam stores, não chamam API, não conhecem "deck", "Premium" ou "Skool".

**2. Todos os outros componentes, páginas e layouts — produto**
- **Não usam classes Tailwind no template.** Nenhuma. Nem `flex`, nem `mt-4`.
- Compõem componentes `Ui*` e outros componentes do produto.
- Quando precisam de layout/estilo próprio, usam **classes semânticas** que dizem *o que* é o elemento (`.card-question`, `.answer-controls`, `.deck-stack`), definidas em `<style scoped>` usando **só tokens** (`var(--color-ink)`, `var(--space-4)`…). Nada de hex, px mágicos ou fontes soltas.
- Nomes de classe: kebab-case, prefixados pelo nome do componente (`DeckStack.vue` → `.deck-stack`, `.deck-stack-card`).

Se você está num componente de produto e sente falta de uma classe Tailwind, é sinal de que falta um primitivo em `ui/` ou um token. Crie o primitivo/token; não abra exceção.

## Tokens

- Definidos uma vez em `app/assets/css/main.css` com `@theme` (Tailwind v4 os expõe como CSS vars, que servem tanto para utilitários no `ui/` quanto para `var(...)` nos componentes do produto).
- Nomes semânticos, não literais: `--color-bg`, `--color-surface`, `--color-border`, `--color-ink`, `--color-ink-muted`, `--color-accent`, `--color-focus-bg`, `--color-cta-bg`… Valores iniciais vêm da seção 7 do PRD.
- Cor de deck: cada deck tem um token (`--color-deck-general`, `--color-deck-behavioral`…). Componentes recebem a cor pela CSS var `--deck-accent`, definida no container, e nunca por prop de hex.

## Regras do produto que afetam o código

- **App em inglês** (UI, textos, mensagens de erro). Código, nomes e commits em inglês. Documentação em `docs/` pode ser em português.
- Textos de UI centralizados (ex.: `app/content/copy.ts`), não espalhados em templates.
- **Hints e respostas modelo são Premium: as páginas Free nunca baixam `#build/premium`** (coberto pelo e2e). O cliente Free não filtra conteúdo Premium; ele simplesmente não o recebe.
- *(premium-ai)* Feedback de IA também é Premium e o plano é decidido sempre no servidor.
- *(premium-ai)* Chaves de IA e `service_role` do Supabase só em `server/`. Nada de chamada a LLM a partir do browser.
- *(premium-ai)* Resposta da IA é validada com o schema Zod do PRD 6.4 (`summary`, `scores`, `tip`, `quote`, `follow_up`) antes de ir ao cliente. Se falhar, erro tratado, não JSON cru.
- *(premium-ai)* Não guardar áudio. O áudio vai para transcrição e é descartado.
- Links do Skool vêm de `runtimeConfig.public` (env `NUXT_PUBLIC_SKOOL_*`). Nunca hardcoded.
- CTA do Skool: um por tela, no rodapé, sempre o mesmo componente (`CtaSkool`). Nada de modal ou banner.
- Desktop precisa funcionar para compartilhamento de tela: carta ~620px centralizada. Atalhos: `Space` inicia/pausa o timer, `→` próxima carta (via `useKeyboardShortcuts`, ignorando quando o foco está em campo de texto).
- Mobile-first (390px). Alvos de toque ≥ 44px. Botão principal: pílula de 54px.
- Acessibilidade: HTML semântico (`button` para ações, `main`, `header`), foco visível, `aria-live` no status do timer, respeitar `prefers-reduced-motion` nas animações de carta.
- Fora do escopo v1 (não construir): gamificação, salas ao vivo dentro do app, pagamento, conteúdo de "Learn".

## Convenções de código

- Um componente por arquivo, `PascalCase.vue`. Props e emits tipados (`defineProps<...>()`, `defineEmits<...>()`).
- Páginas finas; lógica nas telas, composables e stores; regras de negócio (embaralhamento, ordem da sessão, disponibilidade de deck) em funções puras testáveis.
- *(premium-ai)* `useFetch`/`$fetch` só contra `server/api/`. O cliente usa o Supabase direto apenas para auth.
- *(premium-ai)* Toda mudança de banco = nova migration em `supabase/migrations/` + RLS habilitado na tabela.
- Sem dependência nova sem motivo claro; prefira o que Nuxt/Vue já oferecem.

## Comandos

Node e pnpm vêm do `mise.toml` (`mise install`). Copie `.env.example` para `.env` (links do Skool; o build falha sem eles).

```bash
pnpm install
pnpm dev          # servidor local (http://localhost:3000)
pnpm lint         # eslint, inclui as regras de estilo (eslint/interview-deck-plugin.mjs)
pnpm typecheck    # nuxt typecheck
pnpm test         # vitest (test/unit e test/nuxt)
pnpm test:e2e     # playwright em 390px e 1280px, contra o build estático
pnpm generate     # site estático em .output/public (é o que vai para a Vercel)
```

A regra "sem Tailwind fora de `ui/`" e "só tokens no `<style>`" é verificada pelo lint: toda classe usada no template de um componente de produto precisa estar declarada no `<style>` do próprio arquivo, e o `<style>` não aceita cor nem tamanho literal (exceto `0`, `1px` e condições de `@media`).

## Antes de dizer que terminou

1. `pnpm lint`, `pnpm typecheck` e `pnpm test` passam.
2. Nenhuma classe Tailwind fora de `app/components/ui/`.
3. Nenhuma cor/tamanho literal fora de `main.css`.
4. A tela foi conferida em 390px e em desktop, comparando com o screenshot de referência.
5. Nada Premium vaza para o Free: as páginas Free não baixam `#build/premium` (`pnpm test:e2e` confere) e só mostram o General.
