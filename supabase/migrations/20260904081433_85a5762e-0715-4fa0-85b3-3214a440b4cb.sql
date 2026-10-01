ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS support_path TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS support_label TEXT NOT NULL DEFAULT '';

CREATE POLICY "Users read their own interview supports"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'interview-supports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload their own interview supports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'interview-supports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own interview supports"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'interview-supports' AND (storage.foldername(name))[1] = auth.uid()::text);