-- La formule (gratuite / payante) ne peut pas être modifiée par le candidat depuis l'application.
-- Seuls le rôle admin et les traitements serveur (inscription, futur paiement) peuvent la changer.
create or replace function public.protect_profile_plan()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Traitements serveur (création du profil à l'inscription, clé service) : autorisés.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  -- Administrateur : autorisé (par exemple pour ouvrir un accès à la main).
  if public.has_role(auth.uid(), 'admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.plan := 'free';
  elsif new.plan is distinct from old.plan then
    raise exception 'La formule ne peut pas être modifiée depuis l''application.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_plan on public.profiles;
create trigger protect_profile_plan
  before insert or update on public.profiles
  for each row execute function public.protect_profile_plan();
