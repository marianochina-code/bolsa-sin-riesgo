export type Side = "long" | "short";
export type OrderType = "market" | "limit";

export type Settings = {
  capital: number;
  leverage: number;
  commissionPct: number;
  commissionMin: number;
  taxPct: number;
  maxRiskPct: number;
  minRR: number;
};

export type Journal = { reason: string; emotion: string; notes: string; entryShot?: string | undefined; exitShot?: string | undefined };

export type Order = {
  id: string; symbol: string; side: Side; type: OrderType; qty: number;
  limitPrice?: number | undefined; sl: number; tp: number; createdAt: number; journal: Journal;
};

export type Position = {
  id: string; symbol: string; side: Side; qty: number; entry: number; sl: number; tp: number;
  openedAt: number; entryCommission: number; journal: Journal;
};

export type Trade = Position & {
  exit: number; closedAt: number; exitReason: "stop-loss" | "take-profit" | "manual";
  gross: number; commissions: number; tax: number; net: number;
};

export type Account = { settings: Settings; cash: number; orders: Order[]; positions: Position[]; trades: Trade[] };

export const MAX_RISK_PCT = 2;

export const DEFAULT_SETTINGS: Settings = {
  capital: 1000, leverage: 1, commissionPct: 0.5, commissionMin: 1, taxPct: 15, maxRiskPct: 1, minRR: 2,
};

export const newAccount = (s: Settings = DEFAULT_SETTINGS): Account => ({
  settings: { ...s, maxRiskPct: Math.min(s.maxRiskPct, MAX_RISK_PCT), minRR: Math.max(s.minRR, 2) },
  cash: s.capital, orders: [], positions: [], trades: [],
});

const r2 = (n: number) => Math.round(n * 100) / 100;
const dir = (s: Side) => (s === "long" ? 1 : -1);

export const commission = (s: Settings, notional: number) =>
  r2(Math.max(s.commissionMin, (notional * s.commissionPct) / 100));

export const unrealized = (p: Position, price: number) => (price - p.entry) * p.qty * dir(p.side);

export function usedMargin(a: Account) {
  return a.positions.reduce((t, p) => t + (p.entry * p.qty) / a.settings.leverage, 0);
}

export function equity(a: Account, prices: Record<string, number>) {
  return a.positions.reduce((t, p) => t + unrealized(p, prices[p.symbol] ?? p.entry), a.cash);
}

/** Max qty so that the risk (entry→SL) stays within maxRiskPct of current cash. */
export function suggestedQty(a: Account, entry: number, sl: number) {
  const perUnit = Math.abs(entry - sl);
  if (perUnit <= 0) return 0;
  return Math.floor(((a.cash * a.settings.maxRiskPct) / 100 / perUnit) * 1000) / 1000;
}

export function validateOrder(a: Account, o: Omit<Order, "id" | "createdAt">, marketPrice: number): string | null {
  const entry = o.type === "market" ? marketPrice : o.limitPrice;
  if (!entry || entry <= 0) return "Precio límite inválido";
  if (!(o.qty > 0)) return "Cantidad inválida";
  if (!(o.sl > 0) || !(o.tp > 0)) return "Stop-Loss y Take-Profit son obligatorios";
  if (o.side === "long" && !(o.sl < entry && o.tp > entry)) return "En compra: Stop-Loss debajo y Take-Profit arriba del precio de entrada";
  if (o.side === "short" && !(o.sl > entry && o.tp < entry)) return "En venta corta: Stop-Loss arriba y Take-Profit debajo del precio de entrada";
  const risk = Math.abs(entry - o.sl) * o.qty;
  const maxRisk = (a.cash * a.settings.maxRiskPct) / 100;
  if (risk > maxRisk + 1e-9) return `Riesgo ${risk.toFixed(2)} supera el ${a.settings.maxRiskPct}% del capital (${maxRisk.toFixed(2)})`;
  const rr = Math.abs(o.tp - entry) / Math.abs(entry - o.sl);
  if (rr < a.settings.minRR - 1e-9) return `Ratio riesgo/beneficio 1:${rr.toFixed(2)} es menor al mínimo 1:${a.settings.minRR}`;
  const margin = (entry * o.qty) / a.settings.leverage;
  const reserved = a.orders.reduce((t, x) => t + ((x.limitPrice ?? 0) * x.qty) / a.settings.leverage, 0);
  const free = a.cash - usedMargin(a) - reserved;
  if (margin + commission(a.settings, entry * o.qty) > free + 1e-9) return "Margen insuficiente para esta posición";
  return null;
}

function open(a: Account, o: Order, price: number, now: number): Account {
  const c = commission(a.settings, price * o.qty);
  const pos: Position = {
    id: o.id, symbol: o.symbol, side: o.side, qty: o.qty, entry: price, sl: o.sl, tp: o.tp,
    openedAt: now, entryCommission: c, journal: o.journal,
  };
  return { ...a, cash: r2(a.cash - c), positions: [...a.positions, pos] };
}

export function placeOrder(a: Account, o: Order, marketPrice: number): Account {
  const err = validateOrder(a, o, marketPrice);
  if (err) throw new Error(err);
  return o.type === "market" ? open(a, o, marketPrice, o.createdAt) : { ...a, orders: [...a.orders, o] };
}

export function cancelOrder(a: Account, id: string): Account {
  return { ...a, orders: a.orders.filter((o) => o.id !== id) };
}

export function closePosition(a: Account, id: string, price: number, now: number, reason: Trade["exitReason"]): Account {
  const p = a.positions.find((x) => x.id === id);
  if (!p) return a;
  const gross = r2(unrealized(p, price));
  const exitC = commission(a.settings, price * p.qty);
  const tax = gross > 0 ? r2((gross * a.settings.taxPct) / 100) : 0;
  const trade: Trade = {
    ...p, exit: price, closedAt: now, exitReason: reason, gross,
    commissions: r2(p.entryCommission + exitC), tax, net: r2(gross - p.entryCommission - exitC - tax),
  };
  return {
    ...a, cash: r2(a.cash + gross - exitC - tax),
    positions: a.positions.filter((x) => x.id !== id), trades: [trade, ...a.trades],
  };
}

/** Fill pending limit orders and trigger SL/TP against latest prices. */
export function processPrices(a: Account, prices: Record<string, number>, now: number): Account {
  let acc = a;
  for (const o of a.orders) {
    const px = prices[o.symbol];
    if (px == null || o.limitPrice == null) continue;
    const hit = o.side === "long" ? px <= o.limitPrice : px >= o.limitPrice;
    if (hit) acc = open({ ...acc, orders: acc.orders.filter((x) => x.id !== o.id) }, o, o.limitPrice, now);
  }
  for (const p of acc.positions) {
    const px = prices[p.symbol];
    if (px == null) continue;
    const slHit = p.side === "long" ? px <= p.sl : px >= p.sl;
    const tpHit = p.side === "long" ? px >= p.tp : px <= p.tp;
    if (slHit) acc = closePosition(acc, p.id, p.sl, now, "stop-loss");
    else if (tpHit) acc = closePosition(acc, p.id, p.tp, now, "take-profit");
  }
  return acc;
}
