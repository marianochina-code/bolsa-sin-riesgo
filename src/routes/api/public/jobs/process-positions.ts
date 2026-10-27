import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/process-positions")({
  server: { handlers: { POST: async ({ request }) => {
    const failure = await authenticateCronRequest(request);
    if (failure) return failure;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { mutateAccount } = await import("@/lib/accounts.server");
    const { readMarketPrices } = await import("@/lib/market.server");
    const { processPrices } = await import("@/lib/trading");
    let offset = 0, processed = 0;
    for (;;) {
      const { data: rows, error } = await supabaseAdmin.from("paper_accounts").select("user_id,data").order("user_id").range(offset, offset + 99);
      if (error) return Response.json({ error: "Processing failed" }, { status: 500 });
      if (!rows?.length) break;
      const active = rows.filter((row) => {
        const a = row.data as unknown as import("@/lib/trading").Account;
        return a.positions.length || a.orders.length;
      });
      const symbols = active.flatMap((row) => {
        const a = row.data as unknown as import("@/lib/trading").Account;
        return [...a.positions.map((p) => p.symbol), ...a.orders.map((o) => o.symbol)];
      });
      const prices = await readMarketPrices(symbols);
      const results = await Promise.allSettled(active.map((row) => mutateAccount(supabaseAdmin, row.user_id, async (a) => {
        if (!a) throw new Error("Missing account");
        return processPrices(a, prices, Date.now());
      })));
      if (results.some((r) => r.status === "rejected")) return Response.json({ error: "Processing incomplete" }, { status: 500 });
      if (symbols.length && !Object.keys(prices).length) return Response.json({ error: "Prices unavailable" }, { status: 503 });
      processed += active.length;
      offset += rows.length;
      if (rows.length < 100) break;
    }
    return Response.json({ ok: true, processed });
  } } },
});