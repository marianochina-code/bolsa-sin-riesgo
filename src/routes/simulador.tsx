import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getChart, getQuotes, searchSymbols } from "@/lib/market.functions";
import {
  cancelOrder, closePosition, equity, newAccount, placeOrder, processPrices, unrealized, usedMargin,
  type Account, type Settings,
} from "@/lib/trading";
import { Section } from "@/components/site";
import { SetupForm } from "@/components/trading/SetupForm";
import { OrderTicket } from "@/components/trading/OrderTicket";
import { exportCsv, TradeLog } from "@/components/trading/TradeLog";

export const Route = createFileRoute("/simulador")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Simulador de paper trading con datos en tiempo real — BolsaPráctica" },
      { name: "description", content: "Practicá trading con cotizaciones reales, órdenes límite, stop-loss, take-profit, comisiones, impuestos y bitácora de operaciones." },
      { property: "og:title", content: "Simulador de paper trading en tiempo real" },
      { property: "og:description", content: "Órdenes avanzadas, gestión de riesgo obligatoria y trading journal. Sin poner plata." },
      { property: "og:url", content: "/simulador" },
    ],
    links: [{ rel: "canonical", href: "/simulador" }],
  }),
  component: Simulador,
});

const SYMBOLS: [string, string][] = [
  ["AAPL", "Apple"], ["MSFT", "Microsoft"], ["NVDA", "NVIDIA"], ["AMZN", "Amazon"], ["TSLA", "Tesla"],
  ["MELI", "MercadoLibre"], ["YPF", "YPF"], ["GGAL", "Grupo Galicia"], ["SPY", "ETF S&P 500"], ["QQQ", "ETF Nasdaq 100"],
  ["BTC-USD", "Bitcoin (24/7)"], ["ETH-USD", "Ethereum (24/7)"],
];
const usd = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "USD" });

function Simulador() {
  const [acc, setAcc] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState("AAPL");
  const [tab, setTab] = useState<"pos" | "ord" | "log">("pos");
  const [watch, setWatch] = useState<[string, string][]>(SYMBOLS);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const fetchQuotes = useServerFn(getQuotes);
  const fetchChart = useServerFn(getChart);
  const doSearch = useServerFn(searchSymbols);

  useEffect(() => {
    try { const w = localStorage.getItem("watchlist"); if (w) setWatch(JSON.parse(w)); } catch { /* ignore */ }
  }, []);
  useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 350); return () => clearTimeout(t); }, [q]);
  const updateWatch = (w: [string, string][]) => { setWatch(w); localStorage.setItem("watchlist", JSON.stringify(w)); };
  const search = useQuery({ queryKey: ["search", dq], queryFn: () => doSearch({ data: { q: dq } }), enabled: dq.length > 0 });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { setAcc(null); setLoaded(true); return; }
    setLoaded(false);
    supabase.from("paper_accounts").select("data").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setAcc((data?.data as unknown as Account) ?? null);
      setLoaded(true);
    });
  }, [user, loading]);
  const save = (a: Account) => {
    setAcc(a);
    if (!user) return;
    supabase.from("paper_accounts")
      .upsert({ user_id: user.id, data: a as never, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) alert("No se pudo guardar tu cuenta. Revisá tu conexión."); });
  };

  const allSymbols = useMemo(() => {
    const s = new Set(watch.map((w) => w[0]));
    s.add(sel);
    acc?.positions.forEach((p) => s.add(p.symbol));
    acc?.orders.forEach((o) => s.add(o.symbol));
    return [...s].slice(0, 20);
  }, [watch, sel, acc]);

  const quotes = useQuery({
    queryKey: ["quotes", allSymbols.join(",")], queryFn: () => fetchQuotes({ data: { symbols: allSymbols } }),
    refetchInterval: 5000, enabled: !!acc, placeholderData: (p) => p,
  });
  const chart = useQuery({
    queryKey: ["chart", sel], queryFn: () => fetchChart({ data: { symbol: sel } }),
    refetchInterval: 30000, enabled: !!acc,
  });
  const prices = useMemo(() => Object.fromEntries((quotes.data ?? []).map((q) => [q.symbol, q.price])), [quotes.data]);

  useEffect(() => {
    if (!acc || !quotes.data?.length) return;
    const next = processPrices(acc, prices, Date.now());
    if (next !== acc && (next.positions.length !== acc.positions.length || next.orders.length !== acc.orders.length)) save(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  if (loading || !loaded) return <Section className="py-10"><p>Cargando…</p></Section>;

  if (!user)
    return (
      <Section className="max-w-xl py-16 text-center">
        <h1 className="text-3xl font-bold">Simulador de paper trading</h1>
        <p className="mt-3 text-muted-foreground">Creá tu cuenta gratis para que tu cartera, historial y bitácora queden guardados.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/auth" className="rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-cta">Ingresar o crear cuenta</Link>
          <Link to="/tutorial" className="rounded-xl border px-6 py-4 font-bold">Ver tutorial</Link>
        </div>
      </Section>
    );

  if (!acc || editing)
    return (
      <Section className="max-w-2xl py-10">
        <SetupForm initial={acc?.settings} onSave={(s: Settings) => {
          if (acc && !confirm("Esto reinicia tu cuenta y borra el historial. ¿Continuar?")) return;
          save(newAccount(s)); setEditing(false);
        }} />
        {acc && <button onClick={() => setEditing(false)} className="mt-4 text-sm underline">Cancelar</button>}
      </Section>
    );

  const eq = equity(acc, prices);
  const pnl = eq - acc.settings.capital;
  const selQuote = quotes.data?.find((q) => q.symbol === sel);
  const selPos = acc.positions.filter((p) => p.symbol === sel);
  const wins = acc.trades.filter((t) => t.net > 0).length;

  return (
    <Section className="py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Paper trading</h1>
          <p className="text-sm text-muted-foreground">
            Apalancamiento 1:{acc.settings.leverage} · Riesgo máx. {acc.settings.maxRiskPct}% · Ratio mín. 1:{acc.settings.minRR} · Comisión {acc.settings.commissionPct}% (mín. USD {acc.settings.commissionMin}) · Impuesto {acc.settings.taxPct}%
          </p>
        </div>
        <button onClick={() => setEditing(true)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Configuración</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat l="Patrimonio" v={usd(eq)} />
        <Stat l="Efectivo" v={usd(acc.cash)} />
        <Stat l="Margen usado" v={usd(usedMargin(acc))} />
        <Stat l="Resultado total" v={`${pnl >= 0 ? "+" : ""}${usd(pnl)}`} tone={pnl >= 0 ? "text-success" : "text-destructive"} />
        <Stat l="Operaciones ganadoras" v={acc.trades.length ? `${wins}/${acc.trades.length} (${Math.round((wins / acc.trades.length) * 100)}%)` : "–"} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_340px]">
        <div className="rounded-2xl border bg-card p-2 shadow-card lg:max-h-[620px] lg:overflow-auto">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            {quotes.isError ? "Error al cargar cotizaciones" : quotes.dataUpdatedAt ? `En vivo · ${new Date(quotes.dataUpdatedAt).toLocaleTimeString("es-AR")}` : "Conectando…"}
          </p>
          <div className="flex gap-2 overflow-x-auto lg:block">
            {SYMBOLS.map(([s, n]) => {
              const q = quotes.data?.find((x) => x.symbol === s);
              const ch = q ? ((q.price - q.prevClose) / q.prevClose) * 100 : 0;
              return (
                <button key={s} onClick={() => setSel(s)} className={`w-40 shrink-0 rounded-xl px-3 py-2 text-left lg:w-full ${sel === s ? "bg-secondary" : ""}`}>
                  <div className="flex justify-between gap-2 text-sm font-bold"><span>{s}</span><span className="tabular-nums">{q ? q.price.toFixed(2) : "…"}</span></div>
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{n}</span>
                    <span className={ch >= 0 ? "text-success" : "text-destructive"}>{q ? `${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%` : ""}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">{sel}</h2>
            <span className="text-xs text-muted-foreground">
              Mercado {selQuote?.state ?? "…"} · Gráfico intradía 1 min
            </span>
          </div>
          <div className="mt-3 h-72 md:h-[540px]">
            {chart.data?.points.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data.points}>
                  <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} minTickGap={40} fontSize={11} />
                  <YAxis domain={["auto", "auto"]} fontSize={11} width={60} />
                  <Tooltip labelFormatter={(t) => new Date(t as number).toLocaleString("es-AR")} formatter={(v: number) => v.toFixed(2)} />
                  <Line type="monotone" dataKey="p" stroke="var(--primary)" dot={false} strokeWidth={2} isAnimationActive={false} />
                  {selPos.map((p) => [
                    <ReferenceLine key={p.id + "e"} y={p.entry} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "Entrada", fontSize: 10 }} />,
                    <ReferenceLine key={p.id + "s"} y={p.sl} stroke="var(--destructive)" label={{ value: "SL", fontSize: 10 }} />,
                    <ReferenceLine key={p.id + "t"} y={p.tp} stroke="var(--success)" label={{ value: "TP", fontSize: 10 }} />,
                  ])}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-sm text-muted-foreground">{chart.data?.error ?? "Cargando gráfico…"}</p>
            )}
          </div>
        </div>

        <OrderTicket account={acc} symbol={sel} price={prices[sel]} onPlace={(o) => {
          try { save(placeOrder(acc, o, prices[sel] ?? 0)); setTab(o.type === "market" ? "pos" : "ord"); } catch (e) { alert((e as Error).message); }
        }} />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {([["pos", `Posiciones (${acc.positions.length})`], ["ord", `Órdenes pendientes (${acc.orders.length})`], ["log", `Historial (${acc.trades.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${tab === k ? "bg-ink text-ink-foreground" : "bg-secondary"}`}>{l}</button>
        ))}
        {tab === "log" && acc.trades.length > 0 && (
          <button onClick={() => exportCsv(acc.trades)} className="ml-auto shrink-0 rounded-full border px-4 py-2 text-sm font-semibold">Exportar a Excel (CSV)</button>
        )}
      </div>

      <div className="mt-4">
        {tab === "pos" && (acc.positions.length ? (
          <div className="space-y-3">
            {acc.positions.map((p) => {
              const px = prices[p.symbol] ?? p.entry;
              const u = unrealized(p, px);
              return (
                <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-4 shadow-card">
                  <div className="min-w-0 text-sm">
                    <p className="font-display font-bold">{p.symbol} · {p.side === "long" ? "Compra" : "Venta corta"} · {p.qty}</p>
                    <p className="text-muted-foreground">Entrada {p.entry.toFixed(2)} · Actual {px.toFixed(2)} · SL {p.sl} · TP {p.tp}</p>
                    <p className="truncate text-muted-foreground">Por qué: {p.journal.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold tabular-nums ${u >= 0 ? "text-success" : "text-destructive"}`}>{u >= 0 ? "+" : ""}{u.toFixed(2)}</p>
                    <button onClick={() => save(closePosition(acc, p.id, px, Date.now(), "manual"))} className="mt-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ink-foreground">Cerrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Empty t="No tenés posiciones abiertas." />)}

        {tab === "ord" && (acc.orders.length ? (
          <div className="space-y-3">
            {acc.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-sm shadow-card">
                <p className="min-w-0">
                  <b>{o.symbol}</b> · Límite {o.side === "long" ? "compra" : "venta"} {o.qty} @ {o.limitPrice} · SL {o.sl} · TP {o.tp}
                </p>
                <button onClick={() => save(cancelOrder(acc, o.id))} className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold">Cancelar</button>
              </div>
            ))}
          </div>
        ) : <Empty t="No hay órdenes pendientes." />)}

        {tab === "log" && (
          <TradeLog trades={acc.trades} onJournal={(id, j) => save({ ...acc, trades: acc.trades.map((t) => (t.id === id ? { ...t, journal: j } : t)) })} />
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Cotizaciones de mercado real (fuente pública; las acciones solo se mueven en horario de bolsa de EE.UU., las cripto 24/7). Herramienta educativa: no es asesoramiento financiero.
      </p>
    </Section>
  );
}

function Stat({ l, v, tone = "" }: { l: string; v: string; tone?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="text-xs text-muted-foreground">{l}</p>
      <p className={`mt-1 font-display text-lg font-bold tabular-nums md:text-xl ${tone}`}>{v}</p>
    </div>
  );
}
const Empty = ({ t }: { t: string }) => <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t}</p>;
