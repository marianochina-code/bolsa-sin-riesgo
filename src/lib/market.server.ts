export async function readMarketPrices(symbols: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all([...new Set(symbols)].map(async (symbol) => {
    if (!/^[A-Z0-9.\-^=]{1,15}$/.test(symbol)) return null;
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m&includePrePost=false`, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" }, signal: AbortSignal.timeout(3500),
      });
      if (!response.ok) return null;
      const json = await response.json() as { chart?: { result?: { meta?: { regularMarketPrice?: number } }[] } };
      const price = json.chart?.result?.[0]?.meta?.regularMarketPrice;
      return typeof price === "number" && Number.isFinite(price) && price > 0 ? [symbol, price] as const : null;
    } catch { return null; }
  }));
  return Object.fromEntries(entries.filter((e): e is readonly [string, number] => e !== null));
}