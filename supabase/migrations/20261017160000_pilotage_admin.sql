-- Espace admin « Pilotage » : lecture seule des données de tous les candidats, réservée au rôle admin.
-- Les règles existantes (chaque candidat ne lit que ses propres données) ne changent pas.

create policy "admin lit tous les profils" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit tous les rôles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit toutes les expériences" on public.experiences
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit tous les projets" on public.career_projects
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit toutes les fiches école" on public.school_sheets
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit tous les sujets d'actualité" on public.news_topics
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit tous les supports" on public.interview_supports
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit toutes les réponses" on public.question_answers
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit tous les entretiens" on public.interview_sessions
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin lit toutes les évaluations" on public.interview_evaluations
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Adresse e-mail des comptes (stockée par Supabase Auth, illisible depuis le navigateur) : admin uniquement.
create or replace function public.admin_emails()
returns table (user_id uuid, email text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text
  from auth.users u
  where public.has_role(auth.uid(), 'admin');
$$;
revoke all on function public.admin_emails() from public, anon;
grant execute on function public.admin_emails() to authenticated;

-- Temps réel : la page Pilotage se met à jour à chaque inscription, entretien ou évaluation.
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.interview_sessions;
alter publication supabase_realtime add table public.interview_evaluations;
