import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Account } from "./trading";

export async function mutateAccount(client: SupabaseClient<Database>, userId: string, mutate: (account: Account | null) => Promise<Account>) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: row, error } = await client.from("paper_accounts").select("data,updated_at").eq("user_id", userId).maybeSingle();
    if (error) throw new Error("No se pudo leer tu cuenta.");
    const next = await mutate(row ? row.data as unknown as Account : null);
    const { data: saved, error: saveError } = await client.rpc("commit_paper_account", {
      p_user_id: userId, p_data: next as never, p_expected: (row?.updated_at ?? null) as never,
    });
    if (saveError) throw new Error("No se pudo guardar la cuenta.");
    if (saved) return (saved as unknown as { data: Account }).data;
  }
  throw new Error("Tu cuenta cambió mientras guardabas. Intentá nuevamente.");
}