ALTER TABLE public.question_attempts ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT '';
ALTER TABLE public.question_answers ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT '';