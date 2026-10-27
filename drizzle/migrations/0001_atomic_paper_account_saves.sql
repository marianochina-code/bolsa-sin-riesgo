CREATE OR REPLACE FUNCTION public.commit_paper_account(p_user_id uuid, p_data jsonb, p_expected timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE saved public.paper_accounts;
BEGIN
 IF p_expected IS NULL THEN
  INSERT INTO public.paper_accounts(user_id, data) VALUES(p_user_id, p_data) ON CONFLICT (user_id) DO NOTHING RETURNING * INTO saved;
 ELSE
  UPDATE public.paper_accounts SET data = p_data, updated_at = clock_timestamp() WHERE user_id = p_user_id AND updated_at = p_expected RETURNING * INTO saved;
 END IF;
 IF saved.user_id IS NULL THEN RETURN NULL; END IF;
 RETURN jsonb_build_object('data', saved.data, 'updated_at', saved.updated_at);
END; $$;
REVOKE ALL ON FUNCTION public.commit_paper_account(uuid,jsonb,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commit_paper_account(uuid,jsonb,timestamptz) TO authenticated, service_role;