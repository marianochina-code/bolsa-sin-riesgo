CREATE TABLE public.paper_accounts (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_accounts TO authenticated;
GRANT ALL ON public.paper_accounts TO service_role;
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.paper_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.paper_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.paper_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.paper_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);