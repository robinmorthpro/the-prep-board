CREATE TABLE public.news_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  why_important TEXT NOT NULL DEFAULT '',
  stakes TEXT NOT NULL DEFAULT '',
  causes TEXT NOT NULL DEFAULT '',
  consequences TEXT NOT NULL DEFAULT '',
  personal_interest TEXT NOT NULL DEFAULT '',
  interview_link TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo',
  ai_feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_topics TO authenticated;
GRANT ALL ON public.news_topics TO service_role;

ALTER TABLE public.news_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own news topics" ON public.news_topics
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_news_topics_updated_at BEFORE UPDATE ON public.news_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();