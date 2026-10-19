import { describe, expect, it } from "vitest";
import { closePosition, DEFAULT_SETTINGS, newAccount, placeOrder, processPrices, validateOrder, type Order } from "@/lib/trading";

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
    const t = a.trades[0]!;
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
    expect(a.trades[0]!.exitReason).toBe("stop-loss");
    expect(a.trades[0]!.exit).toBe(95);
  });
  it("ejecuta orden límite cuando el precio la alcanza", () => {
    let a = placeOrder(newAccount(), base({ type: "limit", limitPrice: 98, sl: 94, tp: 106 }), 100);
    expect(a.positions).toHaveLength(0);
    a = processPrices(a, { AAPL: 97.5 }, 5);
    expect(a.positions[0]!.entry).toBe(98);
  });
});
