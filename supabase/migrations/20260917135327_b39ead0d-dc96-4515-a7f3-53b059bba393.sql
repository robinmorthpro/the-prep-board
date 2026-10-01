ALTER TABLE public.impact_question_cursors RENAME TO draw_cursors;
ALTER TABLE public.draw_cursors RENAME COLUMN axis TO bank_key;

UPDATE public.draw_cursors
SET bank_key = 'esc-clermont:' || bank_key
WHERE bank_key IN ('people', 'planet', 'profit');

ALTER POLICY "Users manage their own impact cursors" ON public.draw_cursors RENAME TO "Users manage their own draw cursors";

GRANT SELECT, INSERT, UPDATE, DELETE ON public.draw_cursors TO authenticated;
GRANT ALL ON public.draw_cursors TO service_role;