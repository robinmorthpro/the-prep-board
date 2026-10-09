ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS percentile integer NULL CHECK (percentile BETWEEN 1 AND 99),
  ADD COLUMN IF NOT EXISTS feedback_source text NULL CHECK (feedback_source IN ('nouveau','ancien')),
  ADD COLUMN IF NOT EXISTS feedback_evaluation_id uuid NULL REFERENCES public.interview_evaluations(id);