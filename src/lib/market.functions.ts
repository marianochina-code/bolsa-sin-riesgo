import { createServerFn } from "@tanstack/react-start";

export type Quote = { symbol: string; price: number; prevClose: number; time: number; state: string };
export type Point = { t: number; p: number };

async function yahoo(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as any;
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error("Sin datos");
  return r;
}

const SYMBOL = /^[A-Z0-9.\-^=]{1,15}$/;

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((d: { symbols: string[] }) => ({ symbols: d.symbols.filter((s) => SYMBOL.test(s)).slice(0, 20) }))
  .handler(async ({ data }) => {
    const out = await Promise.all(
      data.symbols.map(async (s): Promise<Quote | null> => {
        try {
          const r = await yahoo(s, "1d", "1m");
          const m = r.meta;
          return {
            symbol: s, price: m.regularMarketPrice, prevClose: m.chartPreviousClose ?? m.previousClose ?? m.regularMarketPrice,
            time: (m.regularMarketTime ?? 0) * 1000,
            state: m.currentTradingPeriod?.regular && Date.now() / 1000 >= m.currentTradingPeriod.regular.start && Date.now() / 1000 <= m.currentTradingPeriod.regular.end ? "abierto" : "cerrado",
          };
        } catch (e) {
          console.error("quote", s, e);
          return null;
        }
      }),
    );
    return out.filter((q): q is Quote => q !== null);
  });

export const getChart = createServerFn({ method: "GET" })
  .inputValidator((d: { symbol: string }) => {
    if (!SYMBOL.test(d.symbol)) throw new Error("Símbolo inválido");
    return d;
  })
  .handler(async ({ data }): Promise<{ points: Point[]; error?: string }> => {
    try {
      const r = await yahoo(data.symbol, "1d", "1m");
      const ts: number[] = r.timestamp ?? [];
      const cl: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
      return { points: ts.map((t, i) => ({ t: t * 1000, p: cl[i] as number })).filter((x) => x.p != null) };
    } catch (e) {
      console.error("chart", e);
      return { points: [], error: "No se pudo cargar el gráfico" };
    }
  });
