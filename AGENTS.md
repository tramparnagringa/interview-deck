# AGENTS.md — Interview Deck

Instruções para qualquer agente de código (Claude Code, Codex, Cursor etc.) e para quem entrar no projeto.

- **O que é o produto:** [docs/interview-deck-prd/PRD.md](docs/interview-deck-prd/PRD.md) (telas de referência em `docs/interview-deck-prd/screenshots/`).
- **Decisões de arquitetura e o porquê:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Leia o PRD antes de construir qualquer tela. Em caso de conflito, o PRD manda no *o quê*; este arquivo manda no *como*.

## Fase atual: só o deck (site estático)

A primeira versão é só o baralho: todos os decks abertos, tirar carta, responder com o timer, próxima carta, CTA do Skool. **Sem IA, sem banco, sem login.** O site é gerado estático (`pnpm generate`) e publicado na Vercel.

- Conteúdo: `app/content/decks/<slug>.json` (perguntas do miolo, por tema/função) e `app/content/stages/{opening,intro,closing}.json` (momentos da entrevista, comuns a todos os decks, cada um com seu timer). O módulo local `modules/decks/` valida os arquivos (Zod) e gera `#build/decks`. Nunca importe os JSON direto no app. Um teste barra pergunta repetida em qualquer arquivo.
- **Etapas:** toda sessão segue uma entrevista: opening (small talk, 30s) → intro ("Tell me about yourself"…) → core (o deck) → closing (salário, contrato, fuso, "questions for us?").
- **Modos:** treino livre (`practice`, todos os níveis) passa pelo deck inteiro e recomeça; mock interview (`mock`, só Premium, `/premium/mock/:deck`) tem opening, intro, `MOCK_CORE_QUESTIONS` perguntas e closing, e termina. Os modos de cada nível estão em `LEVEL_FEATURES`.
- Componentes auto-importados levam o nome da pasta como prefixo (`components/play/PlayMockComplete.vue` → `<PlayMockComplete>`). Nomeie o arquivo com o nome completo, senão o componente não resolve.
- **Níveis de acesso:** um app só, as mesmas telas montadas por páginas diferentes. `/` e `/play/:deck` são Free; `/premium` e `/premium/play/:deck` montam `HomeScreen`/`PlayScreen` com `definePageMeta({ level: 'premium' })`. `useLevel()` dá o nível, o que ele libera (`LEVEL_FEATURES` em `shared/schemas/deck.ts`) e o `basePath` para os links. Páginas são finas: a lógica fica nas telas.
- **Conteúdo Premium:** hint e resposta modelo (`example`) ficam em `#build/premium`, um arquivo separado que só as páginas de nível Premium carregam (`import()` dinâmico no `PlayScreen`). Nunca importe `#build/premium` estaticamente. O campo `source` do JSON é editorial (ex.: `"50-questions"` = ebook da TNG) e nunca vai para o app. Limite aceito: sem login, os hints estão publicados no site e quem achar `/premium` vê.
- A versão completa (Supabase, feedback de IA, Premium por magic link) está no branch `premium-ai`. As seções abaixo sobre Supabase, `server/api` e IA valem quando ela voltar.

## Stack

- **Nuxt 4+** (Vue 3, `<script setup lang="ts">`, Composition API). Nada de Options API.
- **TypeScript** em modo strict. Sem `any` sem justificativa em comentário.
- **Tailwind CSS v4** (via `@tailwindcss/vite`), usado **só** dentro do design system (ver abaixo).
- **Supabase** (Postgres + Auth + RLS) via `@nuxtjs/supabase`.
- **Pinia** para o estado da sessão de prática; composables para comportamento reutilizável.
- **Zod** para validar tudo que cruza fronteira (body de API, resposta da IA, env).
- `@nuxt/fonts` (Figtree), `@nuxt/icon` (Lucide), `@nuxt/eslint`.
- **Vitest** + `@nuxt/test-utils` para unidade/componentes; **Playwright** para fluxos.
- Gerenciador de pacotes: **pnpm**.

## Estrutura de pastas

```
app/
  assets/css/main.css     # Tailwind + tokens (@theme). Única fonte de cores, fontes, raios, sombras.
  components/
    ui/                   # DESIGN SYSTEM — primitivos. Único lugar onde classes Tailwind são permitidas.
    deck/                 # Home: pilha de cartas, seletor de decks
    card/                 # Carta da pergunta, hint, contador
    answer/               # Modo foco: timer ring, controles, gravação
    feedback/             # Tela de feedback de IA (e versão bloqueada)
    cta/                  # CTA para o Skool
    app/                  # Header, menu, selo Premium
  composables/            # useTimer, useRecorder, useKeyboardShortcuts, usePlan, useSkoolLinks…
  stores/                 # Pinia: sessão de prática (deck atual, ordem embaralhada, posição)
  layouts/                # default; o modo foco (fundo #111) é um estado (useFocusMode), não outro layout
  pages/                  # rotas finas: montam componentes, não têm lógica de negócio
server/
  api/                    # Única porta para dados Premium (hints) e para a IA
  utils/                  # cliente Supabase server-side, transcrição, LLM, regras de crédito
shared/
  types/ schemas/         # Tipos e schemas Zod usados por app/ e server/
supabase/
  migrations/             # SQL versionado. Nunca altere o schema pelo dashboard.
  seed/                   # Decks e cartas
docs/
```

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
- **Hints e feedback de IA são Premium: nunca podem chegar ao cliente Free.** O cliente não filtra; o servidor não envia. Decidir plano sempre no servidor.
- Chaves de IA e `service_role` do Supabase só em `server/`. Nada de chamada a LLM a partir do browser.
- Resposta da IA é validada com o schema Zod do PRD 6.4 (`summary`, `scores`, `tip`, `quote`, `follow_up`) antes de ir ao cliente. Se falhar, erro tratado, não JSON cru.
- Não guardar áudio. O áudio vai para transcrição e é descartado.
- Links do Skool vêm de `runtimeConfig.public` (env `NUXT_PUBLIC_SKOOL_*`). Nunca hardcoded.
- CTA do Skool: um por tela, no rodapé, sempre o mesmo componente (`CtaSkool`). Nada de modal ou banner.
- Desktop precisa funcionar para compartilhamento de tela: carta ~620px centralizada. Atalhos: `Space` inicia/pausa o timer, `→` próxima carta (via `useKeyboardShortcuts`, ignorando quando o foco está em campo de texto).
- Mobile-first (390px). Alvos de toque ≥ 44px. Botão principal: pílula de 54px.
- Acessibilidade: HTML semântico (`button` para ações, `main`, `header`), foco visível, `aria-live` no status do timer, respeitar `prefers-reduced-motion` nas animações de carta.
- Fora do escopo v1 (não construir): gamificação, salas ao vivo dentro do app, pagamento, conteúdo de "Learn".

## Convenções de código

- Um componente por arquivo, `PascalCase.vue`. Props e emits tipados (`defineProps<...>()`, `defineEmits<...>()`).
- Páginas finas; lógica em composables/stores; regras de negócio (créditos de feedback, embaralhamento) em funções puras testáveis.
- `useFetch`/`$fetch` só contra `server/api/`. O cliente usa o Supabase direto apenas para auth.
- Toda mudança de banco = nova migration em `supabase/migrations/` + RLS habilitado na tabela.
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
5. Nada Premium vaza para o Free (conferir a resposta da API, não só a UI).
