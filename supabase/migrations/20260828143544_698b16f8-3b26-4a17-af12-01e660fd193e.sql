CREATE TABLE public.interview_supports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'questionnaire',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  cv JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_feedback TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, school)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_supports TO authenticated;
GRANT ALL ON public.interview_supports TO service_role;
ALTER TABLE public.interview_supports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own interview supports" ON public.interview_supports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_interview_supports_updated_at BEFORE UPDATE ON public.interview_supports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();