import { describe, expect, it } from "vitest";
import { closePosition, DEFAULT_SETTINGS, estimatedTakeProfitNet, newAccount, placeOrder, processPrices, takeProfitByPercent, updatePositionLevels, validateOrder, validatePositionLevels, type Order } from "@/lib/trading";

const base = (o: Partial<Order> = {}): Order => ({
  id: "1", symbol: "AAPL", side: "long", type: "market", qty: 1, sl: 95, tp: 110, createdAt: 0,
  journal: { reason: "", emotion: "", notes: "" }, ...o,
});

describe("paper trading", () => {
  it("capital inicial por defecto es USD 1.000", () => {
    expect(newAccount().cash).toBe(1000);
  });
  it("el riesgo máximo por operación no puede superar el 2%", () => {
    expect(newAccount({ ...DEFAULT_SETTINGS, maxRiskPct: 5 }).settings.maxRiskPct).toBe(2);
  });
  it("rechaza operaciones que arriesgan más del % configurado (1%)", () => {
    // riesgo = (100-95)*3 = 15 > 10 (1% de 1000)
    expect(validateOrder(newAccount(), base({ qty: 3 }), 100)).toMatch(/Riesgo/);
  });
  it("exige ratio riesgo/beneficio mínimo 1:2", () => {
    expect(validateOrder(newAccount(), base({ tp: 105 }), 100)).toMatch(/1:2/);
    expect(validateOrder(newAccount(), base({ tp: 110 }), 100)).toBeNull();
  });
  it("exige stop-loss y take-profit", () => {
    expect(validateOrder(newAccount(), base({ sl: 0 }), 100)).toMatch(/obligatorios/);
  });
  it("descuenta comisiones e impuestos del resultado", () => {
    // comisión 0.5% con mínimo 1 USD; impuesto 15% sobre ganancia
    let a = placeOrder(newAccount(), base(), 100);
    a = closePosition(a, "1", 110, 1, "manual");
    const t = a.trades[0];
    if (!t) throw new Error("Missing trade");
    expect(t.gross).toBe(10);
    expect(t.commissions).toBe(2);
    expect(t.tax).toBe(1.5);
    expect(t.net).toBe(6.5);
    expect(a.cash).toBe(1006.5);
  });
  it("ejecuta stop-loss automáticamente", () => {
    let a = placeOrder(newAccount(), base(), 100);
    a = processPrices(a, { AAPL: 94 }, 5);
    expect(a.positions).toHaveLength(0);
    expect(a.trades[0]?.exitReason).toBe("stop-loss");
    expect(a.trades[0]?.exit).toBe(95);
  });
  it("ejecuta orden límite cuando el precio la alcanza", () => {
    let a = placeOrder(newAccount(), base({ type: "limit", limitPrice: 98, sl: 94, tp: 106 }), 100);
    expect(a.positions).toHaveLength(0);
    a = processPrices(a, { AAPL: 97.5 }, 5);
    expect(a.positions[0]?.entry).toBe(98);
  });
});

describe("editing open positions", () => {
  const account = () => placeOrder(newAccount(), base(), 100);
  const position = () => {
    const p = account().positions[0];
    if (!p) throw new Error("Missing position");
    return p;
  };
  it("validates long SL/TP against CURRENT price, not entry", () => {
    expect(validatePositionLevels(position(), 105, 115, 110)).toBeNull();
    expect(validatePositionLevels(position(), 110, 115, 110)).not.toBeNull();
    expect(validatePositionLevels(position(), 105, 110, 110)).not.toBeNull();
  });
  it("validates short levels against current price", () => {
    const p = { ...position(), side: "short" as const };
    expect(validatePositionLevels(p, 95, 85, 90)).toBeNull();
    expect(validatePositionLevels(p, 90, 85, 90)).not.toBeNull();
    expect(validatePositionLevels(p, 95, 90, 90)).not.toBeNull();
  });
  it("2% TP is entry × 1.02 for long and × 0.98 for short", () => {
    expect(takeProfitByPercent(position(), 2)).toBe(102);
    expect(takeProfitByPercent({ ...position(), side: "short" }, 2)).toBe(98);
  });
  it("estimates 0.5% commission per side and 5% profit tax", () => {
    expect(estimatedTakeProfitNet({ ...position(), qty: 10 }, 102)).toBe(8.9);
  });
  it("applies USD 1 minimum commission", () => {
    expect(estimatedTakeProfitNet(position(), 102)).toBe(-0.1);
  });
  it("editing creates no trade, no new position and no commission", () => {
    const a = account();
    const next = updatePositionLevels(a, "1", 96, 108, 100);
    expect(next.cash).toBe(a.cash);
    expect(next.positions).toHaveLength(1);
    expect(next.positions[0]?.entryCommission).toBe(1);
    expect(next.trades).toEqual(a.trades);
    expect(next.orders).toEqual(a.orders);
    expect(next.positions[0]?.tp).toBe(108);
  });
  it("automatic TP uses edited value", () => {
    const next = processPrices(updatePositionLevels(account(), "1", 96, 108, 100), { AAPL: 109 }, 55);
    expect(next.positions).toHaveLength(0);
    expect(next.trades[0]?.exit).toBe(108);
    expect(next.trades[0]?.exitReason).toBe("take-profit");
  });
  it("automatic SL uses edited value", () => {
    const next = processPrices(updatePositionLevels(account(), "1", 96, 108, 100), { AAPL: 95 }, 55);
    expect(next.trades[0]?.exit).toBe(96);
    expect(next.trades[0]?.exitReason).toBe("stop-loss");
  });
  it("rejects invalid levels without mutating the account", () => {
    const a = account();
    expect(() => updatePositionLevels(a, "1", 101, 108, 100)).toThrow();
    expect(a.positions[0]?.sl).toBe(95);
  });
});
