CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  prepa_class TEXT NOT NULL DEFAULT '',
  acquisition_channel TEXT NOT NULL DEFAULT '',
  expectations TEXT[] NOT NULL DEFAULT '{}',
  other_prep TEXT NOT NULL DEFAULT '',
  target_schools TEXT[] NOT NULL DEFAULT '{}',
  choice_1 TEXT NOT NULL DEFAULT '',
  choice_2 TEXT NOT NULL DEFAULT '',
  choice_3 TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free',
  part1_completed BOOLEAN NOT NULL DEFAULT false,
  part2_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  anecdotes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'todo',
  ai_feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own experiences" ON public.experiences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.career_projects (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  job_or_field TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  company_role TEXT NOT NULL DEFAULT '',
  job_names TEXT NOT NULL DEFAULT '',
  qualities TEXT NOT NULL DEFAULT '',
  news TEXT NOT NULL DEFAULT '',
  deepened BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_projects TO authenticated;
GRANT ALL ON public.career_projects TO service_role;
ALTER TABLE public.career_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own career project" ON public.career_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER career_projects_updated BEFORE UPDATE ON public.career_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.school_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  school TEXT NOT NULL,
  masters TEXT NOT NULL DEFAULT '',
  master_url TEXT NOT NULL DEFAULT '',
  associations TEXT NOT NULL DEFAULT '',
  exchanges TEXT NOT NULL DEFAULT '',
  partners TEXT NOT NULL DEFAULT '',
  specifics TEXT NOT NULL DEFAULT '',
  finished BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, school)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_sheets TO authenticated;
GRANT ALL ON public.school_sheets TO service_role;
ALTER TABLE public.school_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own school sheets" ON public.school_sheets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER school_sheets_updated BEFORE UPDATE ON public.school_sheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.career_projects (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();