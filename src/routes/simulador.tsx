import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { buy, newPortfolio, sell, SEED_STOCKS, STARTING_CASH, tick, totalValue, type Portfolio } from "@/lib/simulator";
import { Section } from "@/components/site";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de inversiones gratis — BolsaPráctica" },
      { name: "description", content: "Comprá y vendé acciones con USD 10.000 virtuales. Practicá trading sin riesgo y sin registrarte." },
      { property: "og:title", content: "Simulador de inversiones gratis — BolsaPráctica" },
      { property: "og:description", content: "Practicá con USD 10.000 virtuales en un mercado simulado." },
      { property: "og:url", content: "/simulador" },
    ],
    links: [{ rel: "canonical", href: "/simulador" }],
  }),
  component: Simulador,
});

const KEY = "bolsapractica-portfolio";
const usd = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "USD" });

function Simulador() {
  const [stocks, setStocks] = useState(SEED_STOCKS);
  const [pf, setPf] = useState<Portfolio>(newPortfolio);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) try { setPf(JSON.parse(saved)); } catch { /* ignore */ }
    const id = setInterval(() => setStocks((s) => tick(s)), 2000);
    return () => clearInterval(id);
  }, []);

  const save = (p: Portfolio) => { setPf(p); localStorage.setItem(KEY, JSON.stringify(p)); };
  const trade = (kind: "buy" | "sell", sym: string, price: number) => {
    try {
      const q = qty[sym] ?? 1;
      save(kind === "buy" ? buy(pf, sym, q, price) : sell(pf, sym, q, price));
      setMsg(`${kind === "buy" ? "Compraste" : "Vendiste"} ${q} ${sym} a ${usd(price)}`);
    } catch (e) { setMsg((e as Error).message); }
  };

  const total = totalValue(pf, stocks);
  const pnl = total - STARTING_CASH;

  return (
    <Section className="py-10">
      <h1 className="text-3xl font-bold md:text-4xl">Simulador de bolsa</h1>
      <p className="mt-2 text-muted-foreground">Dinero 100% virtual. Precios simulados con fines educativos.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Valor total" value={usd(total)} />
        <Stat label="Efectivo virtual" value={usd(pf.cash)} />
        <Stat label="Ganancia / pérdida" value={`${pnl >= 0 ? "+" : ""}${usd(pnl)}`} tone={pnl >= 0 ? "text-success" : "text-destructive"} />
      </div>
      {msg && <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold">{msg}</p>}

      <div className="mt-6 space-y-3">
        {stocks.map((s) => {
          const up = s.price >= s.prev;
          const h = pf.holdings[s.symbol];
          return (
            <div key={s.symbol} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-4 shadow-card md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <p className="font-display font-bold">{s.symbol} <span className="font-sans text-sm font-normal text-muted-foreground">{s.name}</span></p>
                <p className="text-xs text-muted-foreground">{h ? `Tenés ${h.qty} · prom. ${usd(h.avg)}` : "Sin posición"}</p>
              </div>
              <p className={`text-right font-bold tabular-nums ${up ? "text-success" : "text-destructive"}`}>{usd(s.price)}</p>
              <div className="col-span-2 flex gap-2 md:col-span-1">
                <input type="number" min={1} value={qty[s.symbol] ?? 1} aria-label={`Cantidad ${s.symbol}`}
                  onChange={(e) => setQty({ ...qty, [s.symbol]: Math.max(1, Math.floor(+e.target.value || 1)) })}
                  className="w-20 rounded-lg border bg-background px-2 py-2" />
                <button onClick={() => trade("buy", s.symbol, s.price)} className="flex-1 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground md:flex-none">Comprar</button>
                <button onClick={() => trade("sell", s.symbol, s.price)} className="flex-1 rounded-lg bg-ink px-4 py-2 font-bold text-ink-foreground md:flex-none">Vender</button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => { save(newPortfolio()); setMsg("Cartera reiniciada"); }} className="mt-6 text-sm font-semibold text-muted-foreground underline">
        Reiniciar cartera
      </button>
    </Section>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
