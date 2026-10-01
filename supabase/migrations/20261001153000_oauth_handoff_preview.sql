-- Connexion Google depuis l'aperçu de l'éditeur Lovable (iframe), voir src/lib/oauth-popup.ts.
-- La pop-up OAuth dépose un refresh token sous un nonce aléatoire connu de l'iframe seule ;
-- l'iframe le récupère une seule fois (lecture + suppression). Durée de vie : 5 minutes.
-- Appliquée manuellement dans le SQL Editor Supabase le 01/10/2026.

create table public.oauth_handoffs (
  nonce text primary key,
  refresh_token text not null,
  created_at timestamptz not null default now()
);
alter table public.oauth_handoffs enable row level security;
revoke all on public.oauth_handoffs from anon, authenticated;

create or replace function public.put_oauth_handoff(p_nonce text, p_refresh_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_nonce is null or length(p_nonce) < 32 then raise exception 'invalid nonce'; end if;
  delete from public.oauth_handoffs where created_at < now() - interval '5 minutes';
  insert into public.oauth_handoffs (nonce, refresh_token) values (p_nonce, p_refresh_token)
  on conflict (nonce) do nothing;
end $$;

create or replace function public.claim_oauth_handoff(p_nonce text)
returns text language plpgsql security definer set search_path = public as $$
declare t text;
begin
  if p_nonce is null or length(p_nonce) < 32 then return null; end if;
  delete from public.oauth_handoffs
   where nonce = p_nonce and created_at > now() - interval '5 minutes'
  returning refresh_token into t;
  return t;
end $$;

revoke all on function public.put_oauth_handoff(text, text) from public, anon;
revoke all on function public.claim_oauth_handoff(text) from public;
grant execute on function public.put_oauth_handoff(text, text) to authenticated;
grant execute on function public.claim_oauth_handoff(text) to anon, authenticated;
