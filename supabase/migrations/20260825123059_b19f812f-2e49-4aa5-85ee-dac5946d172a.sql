ALTER TABLE public.career_projects
  ADD COLUMN IF NOT EXISTS companies TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS extra_info TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.career_projects.companies IS 'Entreprises ou types d''employeurs de référence pour le métier/domaine';
COMMENT ON COLUMN public.career_projects.extra_info IS 'Informations complémentaires : figures, événements, détails divers';