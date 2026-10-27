import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { cancelOrder, closePosition, newAccount, placeOrder, processPrices, updatePositionLevels, type Order } from "./trading";

const settings = z.object({ capital: z.number().positive(), leverage: z.number().min(1).max(30), commissionPct: z.number().min(0), commissionMin: z.number().min(0), taxPct: z.number().min(0).max(100), maxRiskPct: z.number().min(1).max(2), minRR: z.number().min(2) });
const journal = z.object({ reason: z.string().max(1000), emotion: z.string().max(100), notes: z.string().max(10000), entryShot: z.string().max(2000000).optional(), exitShot: z.string().max(2000000).optional() });
const actionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("levels"), id: z.string(), sl: z.number().positive(), tp: z.number().positive() }),
  z.object({ kind: z.literal("close"), id: z.string() }),
  z.object({ kind: z.literal("cancel"), id: z.string() }),
  z.object({ kind: z.literal("journal"), id: z.string(), journal }),
  z.object({ kind: z.literal("reset"), settings }),
  z.object({ kind: z.literal("process") }),
  z.object({ kind: z.literal("place"), order: z.object({ id: z.string(), symbol: z.string().regex(/^[A-Z0-9.\-^=]{1,15}$/), side: z.enum(["long", "short"]), type: z.enum(["market", "limit"]), qty: z.number().positive(), limitPrice: z.number().positive().optional(), sl: z.number().positive(), tp: z.number().positive(), createdAt: z.number(), journal }) }),
]);
export type AccountAction = z.infer<typeof actionSchema>;

export const changeAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AccountAction) => actionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { mutateAccount } = await import("./accounts.server");
    const { readMarketPrices } = await import("./market.server");
    try {
      const account = await mutateAccount(context.supabase, context.userId, async (current) => {
        if (data.kind === "reset") return newAccount(data.settings);
        if (!current) throw new Error("Primero configurá tu cuenta.");
        if (data.kind === "cancel") return cancelOrder(current, data.id);
        if (data.kind === "journal") return { ...current, trades: current.trades.map((t) => t.id === data.id ? { ...t, journal: data.journal } : t) };
        const symbols = data.kind === "place" ? [data.order.symbol] : data.kind === "process" ? [...current.positions.map((p) => p.symbol), ...current.orders.map((o) => o.symbol)] : [current.positions.find((p) => p.id === data.id)?.symbol ?? ""];
        const prices = await readMarketPrices(symbols);
        if (data.kind === "process") return processPrices(current, prices, Date.now());
        if (data.kind === "place") {
          const price = prices[data.order.symbol];
          if (!price) throw new Error("No se pudo obtener una cotización actual.");
          return placeOrder(current, { ...data.order, createdAt: Date.now() } as Order, price);
        }
        const position = current.positions.find((p) => p.id === data.id);
        if (!position) throw new Error("La posición ya no está abierta.");
        const price = prices[position.symbol];
        if (!price) throw new Error("No se pudo obtener una cotización actual.");
        const processed = processPrices(current, prices, Date.now());
        if (!processed.positions.some((p) => p.id === data.id)) return processed;
        return data.kind === "levels" ? updatePositionLevels(processed, data.id, data.sl, data.tp, price) : closePosition(processed, data.id, price, Date.now(), "manual");
      });
      return { account, error: null };
    } catch (error) {
      return { account: null, error: error instanceof Error ? error.message : "No se pudo guardar." };
    }
  });