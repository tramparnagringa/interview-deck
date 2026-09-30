# Arquitetura — Interview Deck (v1)

Complementa o [PRD](interview-deck-prd/PRD.md). As regras do dia a dia estão em [AGENTS.md](../AGENTS.md); aqui fica o porquê.

## Fase 1 (atual): site estático, só o deck

Decidido em 28/09/2026: a primeira versão não tem IA nem banco. O app é um site estático (`nuxt generate`) com os decks, timer e CTA do Skool, sem login: o Free abre só o General e o Premium (`/premium`) abre todos.

- **Conteúdo no repositório.** `app/content/decks/*.json` e `app/content/stages/*.json` são a fonte editorial (revisada em PR). O módulo `modules/decks/` valida com Zod e gera no build, **escolhendo campo a campo**, dois arquivos: `#build/decks` (decks e etapas, sem conteúdo Premium) e `#build/premium` (hint e resposta modelo por id de carta). A base do conteúdo é o ebook "As 50 Perguntas Mais Comuns em Entrevistas" (TNG), traduzido e adaptado para o mercado internacional (USD, "company" em vez de "startup"); as cartas vindas dele têm `"source": "50-questions"`.
- **Níveis por página, um app só.** `/` é Free e `/premium` é Premium: as páginas só montam as telas (`HomeScreen`, `PlayScreen`) com `definePageMeta({ level })`, e `useLevel()` entrega o nível, o que ele libera e o prefixo dos links. O Free expõe apenas o General; decks específicos são Premium. Premium hoje = hints + follow-ups + selo PREMIUM + CTA do Skool apontando para as salas ao vivo. Um build, um deploy.
- **Hints só onde o nível pede.** O `PlayScreen` carrega `#build/premium` com `import()` dinâmico quando o nível libera hints; as páginas Free nunca baixam esse arquivo (coberto por teste e2e). Decidido em 28/09/2026, aceitando o limite: sem login não existe paywall, os hints estão publicados e quem achar `/premium` vê. Para proteger de verdade: voltar ao modelo com servidor (`premium-ai`).
- **Sessão = uma entrevista.** As perguntas são organizadas pelo momento da entrevista (`STAGES`: opening, intro, core, closing), não só por tema. Opening, intro e closing ficam em `app/content/stages/` e valem para todos os decks; o deck é o core. A ordem da sessão é montada por `buildSessionOrder` (store): uma pergunta de cada etapa compartilhada em volta do core embaralhado.
- **Modos por nível.** Treino livre (todos): o deck inteiro, com follow-up Premium ocasional, e ao fim do closing começa outra sessão. Mock interview (Premium, rota própria `/premium/mock/:deck`): opening → intro → 4 perguntas core → 1 follow-up contextual → closing e uma tela de fim. O mock é Premium por decisão de produto (28/09/2026); como o resto do Premium, não há bloqueio técnico sem login.
- **Estado só no navegador.** Ordem embaralhada e posição no `sessionStorage` (D7). A restauração acontece em `openDeck` (no `onMounted`), porque a página é pré-renderizada e o Pinia sobrescreveria na hidratação um estado lido durante o setup.
- **Timer na carta.** Não há mais tela de resposta separada (29/09/2026): `CardTimer` é montado uma vez por carta (`:key` do id), espera o áudio da pergunta (`CardAudio` emite `finished` quando termina, falha ou está desligado), conta 3-2-1 (`useCountdown`) e inicia o `useTimer`. Trocar de carta zera tudo pela remontagem.
- **Deploy.** `vercel.json` usa `pnpm generate` e publica `.output/public`. Os links do Skool entram no build (validados em `modules/skool-links.ts`).
- **Versão completa guardada** no branch `premium-ai` (D4–D6 abaixo, com Supabase, ElevenLabs Scribe e Claude). Para voltar: reaproveitar `server/`, `supabase/` e as telas de feedback desse branch.

### Próximos passos (ideias, não decididas)

- **Mais conteúdo.** Os oito decks atuais têm 50 perguntas cada; o próximo trabalho editorial é revisar as perguntas de follow-up com base no uso das salas de prática.
- **Perguntas técnicas de repositórios conhecidos.** Importar de repositórios públicos de perguntas de entrevista. Antes, checar a licença de cada fonte: MIT/CC permitem usar com atribuição; sem licença, só como inspiração, reescrevendo. Guardar a origem no JSON do deck (campo `source`, a criar no schema).
- **Ferramentas técnicas.** Um modo de system design (desenhar/explicar uma arquitetura) e um de código online. São produtos diferentes do baralho; avaliar se entram no app ou são links para ferramentas existentes.

O resto deste documento descreve a arquitetura completa (fase com Premium).

## Visão geral

```
Browser (Nuxt/Vue)
  ├─ UI: design system (ui/) + componentes do produto
  ├─ Estado da sessão (Pinia): deck, ordem embaralhada, posição, timer
  ├─ MediaRecorder → áudio da resposta (Premium / crédito grátis)
  └─ $fetch → server/api
                 │
Nuxt server (Nitro)
  ├─ Decide o plano (Free/Premium) a partir da sessão Supabase
  ├─ Entrega cartas (com hint só para Premium)
  ├─ Controla créditos de feedback grátis
  └─ Áudio → transcrição → LLM → JSON validado (Zod)
                 │
Supabase: Auth (anônimo + magic link), Postgres com RLS
```

## Decisões

### D1. Nuxt como app full-stack
Um repositório, um deploy. As rotas de servidor do Nuxt (Nitro) guardam as chaves de IA e o acesso privilegiado ao banco, então não precisamos de backend separado. A maior parte do app é interação no cliente, mas o SSR da Home ajuda no primeiro carregamento e em link previews.

### D2. Design system em duas camadas
- `components/ui/`: primitivos com Tailwind. É o único lugar em que a aparência se decide em utilitários.
- Produto: só componentes `Ui*` e classes semânticas com tokens em `<style scoped>`.

Por quê: os templates do produto ficam legíveis (dizem *o que* é, não *como* se parece), trocar o visual vira mexer em tokens e primitivos, e evitamos o "tailwind soup" espalhado pelo app. O custo é ter que criar um primitivo quando faltar algo, o que é intencional.

Para garantir: regra de lint que proíbe classes utilitárias fora de `components/ui/` (ex.: `eslint-plugin-better-tailwindcss` ou uma regra custom simples). Configurar junto com o scaffold.

### D3. Tokens como fonte única
Tailwind v4 com `@theme` em `main.css`. Cada token vira CSS var, usada pelo `ui/` (via utilitário) e pelo produto (via `var()`). Paleta, fonte, raios, sombras e cores de deck vêm da seção 7 do PRD e do screenshot `08-deck-system.png`.

### D4. Premium é decidido no servidor
Hints e feedback de IA são o que o Premium vende. Se forem para o cliente Free e forem só escondidos na UI, o paywall não existe. Por isso:
- A tabela de cartas não é lida direto pelo cliente. O endpoint `GET /api/decks/:slug/cards` devolve `hint` só quando a sessão é Premium.
- Decks Premium só são listados como "bloqueados" para o Free.

### D5. Identidade: anônima no Free, magic link no Premium (proposta)
- **Free sem cadastro**: Supabase Anonymous Sign-in cria um usuário invisível no primeiro acesso. Isso mantém "abrir e tirar uma carta em 1 toque" e ainda dá um `user_id` no servidor para contar créditos de feedback grátis (contar só no `localStorage` seria fácil de burlar, e cada feedback custa dinheiro).
- **Premium**: magic link por e-mail. O e-mail precisa estar em `premium_members` (lista importada/sincronizada dos membros do Skool). O usuário anônimo pode ser convertido, preservando o histórico.
- Resolve as perguntas "precisa de login no Free?" e "como saber que é Premium?" do PRD 9, mas **precisa da sua validação**.

### D6. Pipeline de feedback de IA
`POST /api/feedback` (multipart: áudio + `card_id`):
1. Autentica, checa o plano; se Free, consome crédito (ou responde `locked` sem chamar a IA).
2. Transcreve o áudio (provedor a definir; não armazenamos o áudio).
3. Chama o LLM com pergunta + hint + transcrição, pedindo o JSON do PRD 6.4.
4. Valida com Zod; se inválido, tenta de novo uma vez e depois retorna erro tratado.
5. Registra o evento (para créditos/métricas) sem guardar a transcrição completa, salvo decisão contrária.

O follow-up ("Answer follow-up") reusa o mesmo endpoint, com o `follow_up` anterior como pergunta.

### D7. Estado da sessão no cliente
Pinia `usePracticeStore`: deck atual, ordem embaralhada (Fisher–Yates, sem repetir até o fim), posição, carta atual. Persistido em `sessionStorage` para sobreviver a um refresh. O timer (`useTimer`) e a gravação (`useRecorder`) são composables separados, testáveis sem UI.

### D8. Rotas (proposta)
| Rota | Tela |
|---|---|
| `/` | Home (01 / 04) |
| `/play/[deck]` | Carta (02 / 05). "Respondendo" (03) é um estado desta página com layout `focus`, para não recarregar a carta |
| `/play/[deck]/feedback` | AI feedback (06) |
| `/about` | About |

## Modelo de dados (rascunho)

```sql
decks            (slug pk, name, tagline, color_token, is_free bool, sort int)
cards            (id uuid pk, deck_slug fk, number int, category text, question text, hint text)
premium_members  (email pk, source text, granted_at, revoked_at)
feedback_events  (id, user_id fk auth.users, card_id fk, kind 'full'|'locked', created_at)
saved_cards      (user_id, card_id, created_at)   -- opcional v1
```

- RLS em tudo. `cards` sem acesso direto do cliente; o servidor lê e filtra o `hint`.
- Conteúdo das cartas versionado em `supabase/seed/` (é conteúdo editorial; revisar em PR).

## Configuração (env)

| Variável | Onde |
|---|---|
| `NUXT_PUBLIC_SKOOL_URL` | público |
| `SUPABASE_URL`, `SUPABASE_KEY` (anon) | público via módulo |
| `SUPABASE_SERVICE_KEY` | só servidor |
| `NUXT_AI_*` (chaves de transcrição e LLM) | só servidor |

## Em aberto

| # | Decisão | Proposta |
|---|---|---|
| 1 | Identificação do Premium | D5: lista de e-mails do Skool + magic link |
| 2 | Free precisa de login? | Não. Usuário anônimo do Supabase |
| 3 | Provedor de transcrição | Avaliar custo/latência (ex.: Whisper, Deepgram, ElevenLabs Scribe) |
| 4 | LLM do feedback | Claude (ex.: Sonnet) com saída estruturada; validar custo por resposta |
| 5 | Hospedagem | Vercel ou Netlify (Nuxt roda nos dois sem ajuste) |
| 6 | Guardar transcrições? | Padrão: não. Só se houver uso claro (histórico do usuário) |
| 7 | Decks e nº de cartas no lançamento | Conteúdo, fora da arquitetura |
