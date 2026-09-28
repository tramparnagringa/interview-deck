-- Interview Deck v1 schema. RLS is enabled on every table.
-- Only `decks` is readable by clients. Everything else is read/written by the Nuxt server
-- with the service role (see docs/ARCHITECTURE.md, D4).

create table public.decks (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  short_name  text not null,
  tagline     text not null default '',
  color       text not null check (color in (
                'general', 'behavioral', 'software-engineering', 'product',
                'design', 'data', 'sales', 'leadership')),
  is_free     boolean not null default false,
  sort        integer not null default 0
);

create table public.cards (
  id         uuid primary key default gen_random_uuid(),
  deck_slug  text not null references public.decks (slug) on delete cascade,
  number     integer not null check (number > 0),
  category   text not null,
  question   text not null,
  -- Premium content: never exposed to Free sessions (the server builds the response).
  hint       text,
  unique (deck_slug, number)
);

create index cards_deck_slug_idx on public.cards (deck_slug);

-- Members imported from Skool (scripts/import-premium.ts). Emails stored lowercased.
create table public.premium_members (
  email       text primary key check (email = lower(email)),
  source      text not null default 'skool',
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz
);

-- One row per AI feedback given ('full') or locked upsell shown ('locked').
-- Used for Free credits and metrics. Transcripts are not stored.
create table public.feedback_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  card_id     uuid references public.cards (id) on delete set null,
  kind        text not null check (kind in ('full', 'locked')),
  created_at  timestamptz not null default now()
);

create index feedback_events_user_created_idx on public.feedback_events (user_id, created_at desc);

-- Deck list with card counts, read by the server.
create view public.deck_summaries
with (security_invoker = true) as
  select d.slug, d.name, d.short_name, d.tagline, d.color, d.is_free, d.sort,
         count(c.id)::integer as card_count
  from public.decks d
  left join public.cards c on c.deck_slug = d.slug
  group by d.slug;

alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.premium_members enable row level security;
alter table public.feedback_events enable row level security;

create policy "Decks are public" on public.decks
  for select to anon, authenticated using (true);

-- Defense in depth: no client role can touch the Premium tables even if a policy is added by mistake.
revoke all on public.cards, public.premium_members, public.feedback_events, public.deck_summaries
  from anon, authenticated;
