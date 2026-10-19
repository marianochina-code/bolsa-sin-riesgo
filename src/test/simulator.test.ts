import { describe, expect, it } from "vitest";
import { buy, newPortfolio, sell, STARTING_CASH } from "@/lib/simulator";

describe("simulador de práctica", () => {
  it("empieza con 10.000 USD virtuales", () => {
    expect(STARTING_CASH).toBe(10000);
    expect(newPortfolio().cash).toBe(10000);
  });
  it("no permite comprar más que el saldo virtual", () => {
    expect(() => buy(newPortfolio(), "AAPL", 100, 200)).toThrow();
  });
  it("no permite vender más acciones de las que tenés", () => {
    const p = buy(newPortfolio(), "AAPL", 2, 100);
    expect(() => sell(p, "AAPL", 3, 100)).toThrow();
    expect(sell(p, "AAPL", 2, 110).cash).toBe(10020);
  });
});
