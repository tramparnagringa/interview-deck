# Interview Deck — PRD (v1)

Referência visual: pasta `screenshots/`. As telas são referência de layout e estilo, não pixel-perfect.

## 1. O que é

Interview Deck é um app web, em inglês, para praticar entrevistas de emprego em voz alta. A pessoa tira uma carta com uma pergunta, responde falando e passa para a próxima.

Conceito: **Pick a card. Answer out loud. Get better.**

O app gratuito é a porta de entrada. O produto pago (Premium) é a preparação completa: hints, feedback de IA e prática com outras pessoas. A comunidade e a venda do Premium acontecem no Skool.

Marca própria, assinada pela Trampar na Gringa (decidido em 29/09/2026): "by Trampar na Gringa" embaixo do logo e no rodapé da carta, que é o que aparece quando alguém compartilha a tela. Nunca como banner nem ao lado do CTA do Skool.

## 2. Objetivo do produto

- Fazer a pessoa praticar com o mínimo de fricção (abrir e tirar uma carta em 1 toque).
- Mostrar, no momento certo, que praticar sozinho não basta, e levar para o Premium no Skool.
- Servir como ferramenta das salas de prática ao vivo (alguém compartilha a tela com o app aberto).

## 3. Planos

| | Free | Premium |
|---|---|---|
| Deck | General Deck | Todos os decks (Behavioral, Software Engineering, Product, Design, Data, Sales, Leadership…) |
| Tirar carta + timer | Sim | Sim |
| Hint na carta | Não | Sim |
| Feedback de IA | Ocasional (ver 6.3) | Em toda resposta |
| Follow-up da IA | Não | Sim |
| Prática com pessoas | CTA para o Skool | Salas ao vivo (no Skool / chamada de vídeo) |

Sem gamificação (XP, níveis, badges) nesta versão.

## 4. Telas

### Free

**01 — Home** (`01-free-home.png`)
- Logo "Interview Deck", botão de menu.
- Chip do deck atual ("General Deck · N cards").
- Deck no centro: carta preta de verso ("Pick a card. Answer out loud.") sobre duas cartas brancas. Tocar no deck tira uma carta.
- Botão principal "Shuffle & draw".
- Alert amarelo no rodapé: "Go further with Premium: hints, AI feedback and live practice." → link Skool.

**02 — Carta** (`02-free-card.png`)
- Topo: fechar (volta à Home), contador "14 of N".
- Carta grande, centralizada: categoria com ponto colorido, número da carta, pergunta, traço azul, rodapé "INTERVIEW DECK".
- Timer na própria carta (desde 29/09/2026, substitui a tela 03): a pergunta é lida em voz alta, conta "3, 2, 1" e o timer começa sozinho. Tocar no timer (ou `Space`) pausa e retoma; antes de começar, inicia na hora; no fim mostra "Time is up" e fica na carta, sem avançar. Botão circular "próxima carta" (também serve como "terminei").
- Alert amarelo no rodapé: "Not sure how to answer? Get hints and AI feedback with Premium." → link Skool.

**03 — Respondendo** (`03-free-answering.png`) — *substituída pelo timer na carta (tela 02). Mantida como referência para a versão com IA.*
- Fundo preto (modo foco).
- Pergunta em versão compacta no topo.
- Ring de contagem regressiva (padrão 2:00) com o tempo no centro e "ANSWER OUT LOUD".
- Status: "Speak now" / "Paused" / "Time is up".
- Botões: pausar/retomar, "I'm done", reiniciar.
- "I'm done" ou fim do tempo → próxima carta (ou tela de feedback, quando houver crédito grátis — ver 6.3).

### Premium

**04 — Home** (`04-premium-home.png`)
- Selo "PREMIUM" no topo.
- Seletor de decks (chips horizontais com a cor de cada deck).
- Deck + "Shuffle & draw", como no Free.
- Dois atalhos: "Practice with AI" e "Practice with people" (este abre o link das salas no Skool).

**05 — Carta com hint** (`05-premium-card-hint.png`)
- Igual à carta Free, com um bloco "Hint" dentro da carta (ex.: "Use STAR…").
- Botão principal "Answer with AI feedback" (grava a resposta → tela 06).
- Link secundário "Just practice with the timer" (vai para a tela 03, sem IA).

**06 — AI feedback** (`06-premium-ai-feedback.png`)
- Resumo em uma frase (ex.: "Good structure. Needs your part.").
- 3 critérios com nota de 1 a 5 e uma nota curta: Structure, Specificity, Clarity.
- "Try this": uma dica concreta, com trecho da transcrição destacado.
- "Interviewer follow-up": uma pergunta de acompanhamento.
- Botões: "Try again" (responde a mesma carta de novo) e "Answer follow-up".

**07 — Sala ao vivo, desktop** (`07-premium-live-practice-desktop.png`)
- Referência de uso, não uma tela a construir: uma chamada de vídeo em que uma pessoa compartilha o app aberto numa carta e a outra responde.
- Requisito derivado: o app precisa funcionar bem no desktop (carta centralizada, legível em compartilhamento de tela) e ter atalhos de teclado: `Space` inicia/pausa o timer, `→` próxima carta.

**08 — Sistema de decks** (`08-deck-system.png`)
- Todos os decks usam a mesma carta preta; cada deck se diferencia por uma cor (ponto + traço).

## 5. Fluxos

- **Free:** Home → Carta (pergunta lida, 3-2-1, timer) → próxima carta.
- **Premium (com IA):** Home → Carta com hint → gravação → AI feedback → Try again / follow-up / próxima.
- **Premium (só timer):** Carta (timer na carta) → próxima carta.

## 6. Regras

### 6.1 CTAs para o Skool
- Todo CTA que leva ao Skool usa o mesmo estilo: bloco amarelo claro (`#FFF4CC`), texto preto, seta à direita.
- Um CTA por tela, no rodapé. Nunca banners ou pop-ups.
- Links configuráveis (variável de ambiente): Skool Free, Skool Premium, salas ao vivo.

### 6.2 Cartas
- Ordem aleatória por sessão, sem repetir até o deck acabar.
- Cada carta: `id`, `deck`, `category` (Behavioral, Motivation, Career, Strengths & Weaknesses, Tell me about yourself, Leadership…), `question`, `hint` (Premium).
- Carta pode ser salva (ícone de marcador) — opcional na v1.

### 6.3 Feedback de IA no Free
- O Free recebe feedback de IA só em algumas respostas, sempre oferecendo o Premium na mesma tela.
- Proposta a validar: 1º feedback liberado na primeira carta respondida; depois 1 por semana.
- Sem crédito: mostrar o feedback bloqueado (conteúdo borrado + "Unlock AI feedback" → Skool), sem chamar a IA. Mostrar esse bloqueio no máximo a cada 3 cartas.

### 6.4 Feedback de IA (Premium)
- Entrada: áudio da resposta → transcrição → LLM com a pergunta e o hint.
- Saída (JSON): `summary`, `scores` {structure, specificity, clarity} (1–5) com `note` cada, `tip`, `quote` (trecho da transcrição), `follow_up`.
- Idioma: inglês.

## 7. Design

- Fonte: Figtree (400–700).
- Cores: fundo `#FAFAF9`, superfície `#FFFFFF`, borda `#E7E7E4`, texto `#111111`, texto secundário `#5F6368`, azul `#2D5BE3` (detalhes), azul claro em fundo escuro `#4A74F0` / `#8FA8F5`, amarelo Skool `#FFF4CC`.
- Tela de resposta: fundo `#111111`.
- Botões principais: pílula preta, 54px de altura. Alvos de toque ≥ 44px.
- Mobile-first (390px) e desktop (carta com ~620px de largura, centralizada).
- Não deve parecer software de RH, curso online ou chatbot. Deve parecer um baralho.

## 8. Fora do escopo (v1)

- Gamificação (XP, streak, níveis, badges, coleção).
- Salas ao vivo dentro do app (acontecem no Skool / chamada de vídeo).
- Pagamento dentro do app (a venda é no Skool).
- Conteúdo de "Learn" (fica no Classroom do Skool).

## 9. Em aberto

- Como o app sabe que a pessoa é Premium (o Premium é vendido no Skool)? Opções: código de acesso, magic link por e-mail de membros, lista importada.
- Quantidade de cartas por deck e quais decks entram no lançamento.
- Regra final do feedback grátis (frequência).
- Precisa de login no Free, ou o Free funciona sem conta?
