create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.interview_evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  model text not null,
  grille text not null default '',
  status text not null check (status in ('ok','invalide')),
  attempts int not null default 1,
  errors jsonb not null default '[]'::jsonb,
  raw_output jsonb,
  raw_text text not null default '',
  case_points jsonb not null default '{}'::jsonb,
  criterion_points jsonb not null default '{}'::jsonb,
  unrated_criteria jsonb not null default '[]'::jsonb,
  penalties jsonb not null default '[]'::jsonb,
  interrupted boolean not null default false,
  score_20 numeric,
  final_score numeric,
  percentile int,
  duration_ms int not null default 0,
  triggered_by text not null default 'auto'
);
create index interview_evaluations_session_idx on public.interview_evaluations (session_id);
grant select, insert on public.interview_evaluations to authenticated;
grant all on public.interview_evaluations to service_role;
alter table public.interview_evaluations enable row level security;
create policy "read own evaluations" on public.interview_evaluations for select to authenticated using (auth.uid() = user_id);
create policy "insert own evaluations" on public.interview_evaluations for insert to authenticated with check (auth.uid() = user_id);