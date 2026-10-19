export const STARTING_CASH = 10000;

export type Stock = { symbol: string; name: string; price: number; prev: number };
export type Portfolio = { cash: number; holdings: Record<string, { qty: number; avg: number }> };

export const SEED_STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple", price: 228.5, prev: 228.5 },
  { symbol: "MSFT", name: "Microsoft", price: 415.2, prev: 415.2 },
  { symbol: "NVDA", name: "NVIDIA", price: 132.8, prev: 132.8 },
  { symbol: "AMZN", name: "Amazon", price: 186.4, prev: 186.4 },
  { symbol: "MELI", name: "MercadoLibre", price: 2010.0, prev: 2010.0 },
  { symbol: "KO", name: "Coca-Cola", price: 69.9, prev: 69.9 },
  { symbol: "SPY", name: "ETF S&P 500", price: 575.3, prev: 575.3 },
  { symbol: "YPF", name: "YPF", price: 22.6, prev: 22.6 },
];

export const newPortfolio = (): Portfolio => ({ cash: STARTING_CASH, holdings: {} });

export function buy(p: Portfolio, symbol: string, qty: number, price: number): Portfolio {
  if (!Number.isInteger(qty) || qty <= 0) throw new Error("Cantidad inválida");
  const cost = qty * price;
  if (cost > p.cash + 1e-9) throw new Error("Saldo virtual insuficiente");
  const h = p.holdings[symbol] ?? { qty: 0, avg: 0 };
  const nq = h.qty + qty;
  return {
    cash: +(p.cash - cost).toFixed(2),
    holdings: { ...p.holdings, [symbol]: { qty: nq, avg: (h.qty * h.avg + cost) / nq } },
  };
}

export function sell(p: Portfolio, symbol: string, qty: number, price: number): Portfolio {
  if (!Number.isInteger(qty) || qty <= 0) throw new Error("Cantidad inválida");
  const h = p.holdings[symbol];
  if (!h || h.qty < qty) throw new Error("No tenés suficientes acciones");
  const holdings = { ...p.holdings };
  if (h.qty === qty) delete holdings[symbol];
  else holdings[symbol] = { ...h, qty: h.qty - qty };
  return { cash: +(p.cash + qty * price).toFixed(2), holdings };
}

export function tick(stocks: Stock[], rand = Math.random): Stock[] {
  return stocks.map((s) => {
    const change = (rand() - 0.5) * 0.012;
    return { ...s, prev: s.price, price: Math.max(1, +(s.price * (1 + change)).toFixed(2)) };
  });
}

export function totalValue(p: Portfolio, stocks: Stock[]): number {
  return Object.entries(p.holdings).reduce((t, [sym, h]) => {
    const s = stocks.find((x) => x.symbol === sym);
    return t + (s ? s.price * h.qty : 0);
  }, p.cash);
}
