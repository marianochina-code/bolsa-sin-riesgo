import { describe, expect, it } from "vitest";
import { mutateAccount } from "@/lib/accounts.server";
import { newAccount, placeOrder, processPrices, type Account } from "@/lib/trading";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

describe("atomic background processing", () => {
  it("retries with the latest account so an offline TP close cannot be resurrected", async () => {
    const opened = placeOrder(newAccount(), { id: "p", symbol: "AAPL", side: "long", type: "market", qty: 1, sl: 95, tp: 110, createdAt: 1, journal: { reason: "test", emotion: "", notes: "" } }, 100);
    const closed = processPrices(opened, { AAPL: 111 }, 2);
    let reads = 0;
    const writes: Account[] = [];
    const client = {
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: reads++ === 0 ? opened : closed, updated_at: String(reads) }, error: null }) }) }) }),
      rpc: async (_name: string, args: { p_data: Account }) => {
        writes.push(args.p_data);
        return { data: writes.length === 1 ? null : { data: args.p_data }, error: null };
      },
    } as unknown as SupabaseClient<Database>;
    const result = await mutateAccount(client, "owner", async (a) => {
      if (!a) throw new Error("Missing account");
      return processPrices(a, { AAPL: 111 }, 3);
    });
    expect(reads).toBe(2);
    expect(result.positions).toHaveLength(0);
    expect(result.trades).toHaveLength(1);
    expect(result.trades[0]?.closedAt).toBe(2);
    expect(result.cash).toBe(closed.cash);
  });
});