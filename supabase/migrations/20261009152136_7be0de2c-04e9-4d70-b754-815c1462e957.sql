CREATE TABLE public.bench_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot text NOT NULL,
  ecole text NOT NULL,
  jury text NOT NULL CHECK (jury IN ('classique','classique_dur')),
  profil text NOT NULL,
  scenario text NOT NULL DEFAULT 'normal',
  graine bigint NOT NULL,
  turns jsonb NOT NULL DEFAULT '[]'::jsonb,
  phase_timings jsonb NOT NULL DEFAULT '[]'::jsonb,
  tirages jsonb NOT NULL DEFAULT '{}'::jsonb,
  document text NOT NULL DEFAULT '',
  support_label text NOT NULL DEFAULT '',
  conversation_id text,
  duree_ms integer NOT NULL DEFAULT 0,
  duree_simulee_s integer NOT NULL DEFAULT 0,
  cout_jury_credits numeric,
  cout_candidat_estime numeric,
  jetons_candidat jsonb NOT NULL DEFAULT '{}'::jsonb,
  statut text NOT NULL DEFAULT 'en_cours',
  erreurs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lot, ecole, jury, scenario, graine)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bench_runs TO authenticated;
GRANT ALL ON public.bench_runs TO service_role;
ALTER TABLE public.bench_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage bench runs" ON public.bench_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_bench_runs_updated_at BEFORE UPDATE ON public.bench_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bench_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.bench_runs(id) ON DELETE CASCADE,
  modele text NOT NULL,
  essai_n integer NOT NULL DEFAULT 1,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  evaluation_brute jsonb,
  evaluation_texte text NOT NULL DEFAULT '',
  case_points jsonb NOT NULL DEFAULT '{}'::jsonb,
  criterion_points jsonb NOT NULL DEFAULT '{}'::jsonb,
  unrated_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  penalties jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  score_20 numeric,
  final_score numeric,
  percentile integer,
  feedback text NOT NULL DEFAULT '',
  citations_retirees jsonb NOT NULL DEFAULT '[]'::jsonb,
  duree_eval_ms integer NOT NULL DEFAULT 0,
  duree_redaction_ms integer NOT NULL DEFAULT 0,
  jetons jsonb NOT NULL DEFAULT '{}'::jsonb,
  cout_estime numeric,
  erreurs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, modele, essai_n)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bench_results TO authenticated;
GRANT ALL ON public.bench_results TO service_role;
ALTER TABLE public.bench_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage bench results" ON public.bench_results FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));