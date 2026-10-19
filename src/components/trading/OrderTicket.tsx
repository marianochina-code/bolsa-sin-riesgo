import { useEffect, useState } from "react";
import { suggestedQty, validateOrder, type Account, type Order, type OrderType, type Side } from "@/lib/trading";
import { EMOTIONS } from "./TradeLog";

const field = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring";

export function OrderTicket({ account, symbol, price, onPlace }: {
  account: Account; symbol: string; price?: number | undefined; onPlace: (o: Order) => void;
}) {
  const [side, setSide] = useState<Side>("long");
  const [type, setType] = useState<OrderType>("market");
  const [limit, setLimit] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [emotion, setEmotion] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setLimit(""); setSl(""); setTp(""); setQty(""); setErr(null); }, [symbol]);

  const entry = type === "market" ? price ?? 0 : Number(limit);
  const slN = Number(sl), tpN = Number(tp), qN = Number(qty);
  const risk = entry && slN ? Math.abs(entry - slN) * (qN || 0) : 0;
  const rr = entry && slN && tpN ? Math.abs(tpN - entry) / Math.abs(entry - slN) : 0;
  const suggested = entry && slN ? suggestedQty(account, entry, slN) : 0;

  const draft = (): Order => ({
    id: crypto.randomUUID(), symbol, side, type, qty: qN,
    limitPrice: type === "limit" ? Number(limit) : undefined, sl: slN, tp: tpN, createdAt: Date.now(),
    journal: { reason, emotion, notes: "" },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return setErr("Esperando cotización en tiempo real…");
    const o = draft();
    const v = validateOrder(account, o, price);
    if (v) return setErr(v);
    setErr(null); onPlace(o); setReason(""); setEmotion(""); setQty("");
  };

  const autoLevels = () => {
    if (!entry) return;
    const d = entry * 0.02;
    const s = side === "long" ? entry - d : entry + d;
    const t = side === "long" ? entry + d * account.settings.minRR : entry - d * account.settings.minRR;
    setSl(s.toFixed(2)); setTp(t.toFixed(2));
    setQty(String(suggestedQty(account, entry, s)));
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Nueva orden · {symbol}</h2>
        <span className="font-bold tabular-nums">{price ? price.toFixed(2) : "…"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Tog on={side === "long"} onClick={() => setSide("long")} tone="buy">Comprar (long)</Tog>
        <Tog on={side === "short"} onClick={() => setSide("short")} tone="sell">Vender (short)</Tog>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Tog on={type === "market"} onClick={() => setType("market")}>A mercado</Tog>
        <Tog on={type === "limit"} onClick={() => setType("limit")}>Límite</Tog>
      </div>
      {type === "limit" && (
        <In l="Precio límite"><input type="number" step="any" required value={limit} onChange={(e) => setLimit(e.target.value)} className={field} /></In>
      )}
      <div className="grid grid-cols-2 gap-2">
        <In l="Stop-Loss"><input type="number" step="any" required value={sl} onChange={(e) => setSl(e.target.value)} className={field} /></In>
        <In l="Take-Profit"><input type="number" step="any" required value={tp} onChange={(e) => setTp(e.target.value)} className={field} /></In>
      </div>
      <In l={`Cantidad${suggested ? ` · máx. por riesgo: ${suggested}` : ""}`}>
        <div className="flex gap-2">
          <input type="number" step="any" min={0} required value={qty} onChange={(e) => setQty(e.target.value)} className={field} />
          {suggested > 0 && <button type="button" onClick={() => setQty(String(suggested))} className="shrink-0 rounded-lg bg-secondary px-3 text-sm font-semibold">Usar</button>}
        </div>
      </In>
      <button type="button" onClick={autoLevels} className="text-sm font-semibold text-primary underline">
        Calcular niveles automáticos (riesgo 2% del precio, ratio 1:{account.settings.minRR})
      </button>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-3 text-sm">
        <p>Riesgo: <b className={risk > (account.cash * account.settings.maxRiskPct) / 100 ? "text-destructive" : ""}>USD {risk.toFixed(2)}</b></p>
        <p>Máx: <b>USD {((account.cash * account.settings.maxRiskPct) / 100).toFixed(2)}</b></p>
        <p>Ratio: <b className={rr && rr < account.settings.minRR ? "text-destructive" : ""}>1:{rr ? rr.toFixed(2) : "–"}</b></p>
        <p>Margen: <b>USD {entry && qN ? ((entry * qN) / account.settings.leverage).toFixed(2) : "0.00"}</b></p>
      </div>
      <In l="¿Por qué entrás? (obligatorio)">
        <input required maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder='Ej. "Ruptura de resistencia"' className={field} />
      </In>
      <In l="¿Cómo te sentís?">
        <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className={field}>
          <option value="">Elegí una opción</option>
          {EMOTIONS.map((x) => <option key={x}>{x}</option>)}
        </select>
      </In>
      {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{err}</p>}
      <button className={`w-full rounded-xl py-3 font-bold shadow-cta ${side === "long" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
        {type === "market" ? "Ejecutar" : "Enviar orden límite"} {side === "long" ? "compra" : "venta"}
      </button>
    </form>
  );
}

function Tog({ on, onClick, children, tone }: { on: boolean; onClick: () => void; children: React.ReactNode; tone?: "buy" | "sell" }) {
  const active = tone === "sell" ? "bg-destructive text-destructive-foreground" : tone === "buy" ? "bg-primary text-primary-foreground" : "bg-ink text-ink-foreground";
  return (
    <button type="button" onClick={onClick} className={`rounded-lg py-2 text-sm font-bold ${on ? active : "bg-secondary text-secondary-foreground"}`}>
      {children}
    </button>
  );
}

function In({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-muted-foreground">{l}<div className="mt-1 text-sm text-foreground">{children}</div></label>;
}
