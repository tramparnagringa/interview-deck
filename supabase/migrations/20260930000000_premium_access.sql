-- Premium access (docs/AUTH.md). Everyone signs in with Google; Premium = an email on the list:
-- - Skool members with tier premium or vip (vip includes everything in premium), replaced as a
--   whole by `pnpm skool:import`: whoever left Premium on Skool loses it on the next import;
-- - the team (tier admin), added by hand and never touched by the import.
--
-- Run once in the Supabase SQL Editor. It also removes the invite tables and functions from the
-- earlier version, if they exist.

drop function if exists public.create_premium_invites(integer, text, integer);
drop function if exists public.claim_premium(text);
drop function if exists public.is_premium();
drop function if exists public.replace_premium_allowlist(jsonb);
drop table if exists public.premium_members;
drop table if exists public.premium_invites;
drop table if exists public.premium_allowlist;

-- Emails with Premium access, lowercase. Team emails are added in the SQL Editor (docs/AUTH.md):
--   insert into public.premium_allowlist (email, tier) values ('someone@example.com', 'admin');
create table public.premium_allowlist (
  email text primary key check (email = lower(email)),
  tier text not null check (tier in ('premium', 'vip', 'admin')),
  imported_at timestamptz not null default now()
);

-- No policies: the app never reads the table; only the two functions below touch it.
alter table public.premium_allowlist enable row level security;

-- Is the signed-in account Premium? Called by the app after every sign-in.
create function public.is_premium()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.premium_allowlist
    where email = lower((select auth.jwt()) ->> 'email')
  );
$$;

-- Replaces the Skool part of the list (premium and vip; admins stay) in one transaction: either
-- the new list is in, or the old one stays.
-- Only the secret (service_role) key can call it: `pnpm skool:import`.
-- entries: [{"email": "...", "tier": "premium" | "vip"}, ...]. Returns how many were imported.
create function public.replace_premium_allowlist(entries jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  imported integer;
begin
  if jsonb_typeof(entries) <> 'array' or jsonb_array_length(entries) = 0 then
    raise exception 'refusing to replace the allowlist with an empty list';
  end if;
  delete from public.premium_allowlist where tier <> 'admin';
  -- One row per email; if an email comes twice, the higher tier wins; an admin email stays admin.
  insert into public.premium_allowlist (email, tier)
  select distinct on (email) email, tier
  from (
    select lower(trim(entry ->> 'email')) as email, entry ->> 'tier' as tier
    from jsonb_array_elements(entries) as entry
  ) as rows
  order by email, (tier = 'vip') desc
  on conflict (email) do nothing;
  get diagnostics imported = row_count;
  return imported;
end;
$$;

revoke execute on function public.is_premium() from public, anon;
grant execute on function public.is_premium() to authenticated;
revoke execute on function public.replace_premium_allowlist(jsonb) from public, anon, authenticated;
grant execute on function public.replace_premium_allowlist(jsonb) to service_role;
