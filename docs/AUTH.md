# Login e acesso Premium

Todo mundo entra com Google. **Premium é quem está na lista**, reconhecido pelo e-mail com que entra no app. A lista tem:

- os membros **`premium` ou `vip` do Skool**, atualizados com um comando que substitui essa parte inteira: quem entrou no Premium do Skool ganha acesso, quem saiu perde;
- a **equipe (`admin`)**, adicionada à mão e que a importação nunca apaga.

Depois do login, Premium vai para `/premium` e o resto para `/`.

## Rotina: atualizar quem é Premium

Sempre que quiser (sugestão: uma vez por mês):

1. No Skool: **Members → Export**. O arquivo `community_members….csv` vai para a pasta Downloads.
2. No projeto:
   ```bash
   pnpm skool:import --dry-run   # só mostra: qual arquivo e quantos premium/vip
   pnpm skool:import             # substitui a lista
   ```
3. Apague o arquivo exportado (ele tem dados pessoais de todos os membros).

Detalhes:
- Entram os membros com tier `premium` ou `vip` (`vip` inclui tudo do `premium`). A equipe (`admin`) não é afetada. De cada um, o e-mail da conta e também o e-mail respondido em "Qual é o seu e-mail?", quando for diferente.
- A troca é tudo ou nada: se algo der errado, a lista antiga fica.
- Um arquivo sem nenhum premium/vip é recusado, para um arquivo errado nunca apagar a lista.
- Sem argumento, usa o `community_members*.csv` mais recente de `~/Downloads`; para outro arquivo, `pnpm skool:import caminho/do/arquivo.csv`.

**Membro Premium que não foi reconhecido:** ele entrou no app com um e-mail diferente do Skool. Peça para entrar com o mesmo e-mail do Skool (ou para trocar o e-mail no Skool e esperar a próxima importação).

## Equipe (admin)

Sempre Premium, independente do Skool. Os e-mails ficam só no banco (não no código). No SQL Editor:

```sql
-- adicionar
insert into public.premium_allowlist (email, tier) values (lower('alguem@exemplo.com'), 'admin')
on conflict (email) do update set tier = 'admin';

-- tirar
delete from public.premium_allowlist where email = lower('alguem@exemplo.com') and tier = 'admin';

-- ver
select email from public.premium_allowlist where tier = 'admin';
```

## Configuração (uma vez)

### 1. Supabase

1. **SQL Editor:** cole e rode `supabase/migrations/20260930000000_premium_access.sql`. Ele cria a lista e as duas funções, e apaga as tabelas de convite de uma versão anterior, se existirem.
2. **Settings → API Keys:** a *Project URL* e a *publishable key* vão no `.env` e na Vercel (abaixo). A *secret key* vai só no seu `.env`, como `SUPABASE_SECRET_KEY`: é ela que deixa o `pnpm skool:import` gravar a lista. Ela ignora as regras de acesso do banco, então **nunca na Vercel nem no código do app**.
3. **Authentication → URL Configuration:**
   - *Site URL:* o domínio de produção.
   - *Redirect URLs:* `https://<domínio>/login**` e `http://localhost:3000/login**`.

### 2. Google (feito)

1. [Google Cloud Console](https://console.cloud.google.com) → crie um projeto (ex.: "Interview Deck").
2. **Google Auth Platform → Branding:** nome "Interview Deck", e-mail de suporte, domínio do app. Não coloque logo agora: com logo o Google exige verificação da marca, que leva dias.
3. **Audience:** tipo *External*, depois **Publish app** (sem publicar, só contas de teste entram).
4. **Data access:** só os escopos básicos (`openid`, `email`, `profile`), que não pedem verificação.
5. **Clients → Create client:** tipo *Web application*.
   - *Authorized JavaScript origins:* o domínio de produção e `http://localhost:3000`.
   - *Authorized redirect URIs:* a callback que o Supabase mostra em Authentication → Providers → Google (`https://<project-ref>.supabase.co/auth/v1/callback`).
6. No Supabase, **Authentication → Providers → Google:** ative e cole o *Client ID* e o *Client secret*.

### 3. Vercel e `.env`

Na Vercel e no `.env`:

```
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<publishable key>
```

Só no `.env` (sua máquina):

```
SUPABASE_SECRET_KEY=<secret key>
```

## Como funciona (para quem mexe no código)

- **Regras de navegação:** `app/utils/access.ts` (testadas em `test/unit/access.test.ts`), aplicadas por `app/middleware/access.global.ts`.
- **Sessão:** `app/plugins/supabase.client.ts` lê a sessão e chama `is_premium()` antes da primeira rota; `useViewer()` expõe o resultado.
- **Banco:** `supabase/migrations/20260930000000_premium_access.sql` — tabela `premium_allowlist` (sem acesso pelo app), `is_premium()` (o app chama) e `replace_premium_allowlist()` (só a secret key).
- **Importação:** `scripts/skool-import.mjs` (testado em `test/unit/skool-import.test.ts`).
- **Limite aceito:** o site é estático e os hints vão publicados no build. O login controla a navegação, não protege o conteúdo.
- **Testes e2e:** `test/e2e/auth.ts` simula o Supabase (sessão falsa no navegador e resposta do `is_premium`). O login com Google é conferido até o redirecionamento.

## Consultas úteis (SQL Editor)

```sql
-- quantos premium/vip e quando foi a última importação
select tier, count(*), max(imported_at) as last_import from public.premium_allowlist group by tier;

-- um e-mail específico está na lista?
select * from public.premium_allowlist where email = lower('fulana@gmail.com');

-- lista de quem já entrou no app (todos, Free e Premium)
select email, created_at, last_sign_in_at from auth.users order by created_at desc;
```
