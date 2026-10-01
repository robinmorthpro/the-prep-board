CREATE TABLE public.impact_question_cursors (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  axis TEXT NOT NULL,
  next_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, axis)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.impact_question_cursors TO authenticated;
GRANT ALL ON public.impact_question_cursors TO service_role;

ALTER TABLE public.impact_question_cursors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own impact cursors"
ON public.impact_question_cursors
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_impact_question_cursors_updated_at
BEFORE UPDATE ON public.impact_question_cursors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();