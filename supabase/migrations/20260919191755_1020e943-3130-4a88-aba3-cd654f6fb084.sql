ALTER TABLE public.interview_sessions
ADD COLUMN IF NOT EXISTS phase_timings jsonb NOT NULL DEFAULT '[]'::jsonb;