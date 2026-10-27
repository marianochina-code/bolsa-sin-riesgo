import { useState } from "react";
import { Button } from "@/components/ui/button";
import { estimatedTakeProfitNet, takeProfitByPercent, unrealized, validatePositionLevels, type Position } from "@/lib/trading";

export function PositionRow({ position: p, price, busy, onEdit, onClose }: {
  position: Position; price?: number; busy: boolean;
  onEdit: (sl: number, tp: number) => Promise<boolean>; onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [sl, setSl] = useState(String(p.sl));
  const [tp, setTp] = useState(String(p.tp));
  const [percent, setPercent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pnl = unrealized(p, price ?? p.entry);
  const field = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground";
  return <div className="rounded-lg border bg-card p-4 shadow-card">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 text-sm">
        <p className="font-display font-bold">{p.symbol} · {p.side === "long" ? "Compra" : "Venta corta"} · {p.qty}</p>
        <p className="text-muted-foreground">Entrada {p.entry.toFixed(2)} · Actual {price?.toFixed(2) ?? "…"} · SL {p.sl} · TP {p.tp}</p>
        <p className="break-words text-muted-foreground">Por qué: {p.journal.reason}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-bold tabular-nums ${pnl >= 0 ? "text-success" : "text-destructive"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" disabled={busy || editing} onClick={() => { setSl(String(p.sl)); setTp(String(p.tp)); setPercent(""); setError(null); setEditing(true); }}>Editar</Button>
          <Button size="sm" disabled={busy || !price} onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
    {editing && <form className="mt-4 border-t pt-4" onSubmit={async (event) => {
      event.preventDefault();
      const validation = validatePositionLevels(p, Number(sl), Number(tp), price ?? 0);
      if (validation) { setError(validation); return; }
      setError(null);
      if (await onEdit(Number(sl), Number(tp))) setEditing(false);
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted-foreground">SL<input aria-label={`SL ${p.symbol}`} type="number" step="any" value={sl} onChange={(e) => setSl(e.target.value)} required className={field} /></label>
        <label className="text-xs font-semibold text-muted-foreground">TP<input aria-label={`TP ${p.symbol}`} type="number" step="any" value={tp} onChange={(e) => { setTp(e.target.value); setPercent(""); }} required className={field} /></label>
        <label className="text-xs font-semibold text-muted-foreground">TP por % de ganancia<input aria-label={`TP por % de ganancia ${p.symbol}`} type="number" step="any" min="0" value={percent} onChange={(e) => {
          setPercent(e.target.value);
          if (e.target.value !== "") setTp(String(takeProfitByPercent(p, Number(e.target.value))));
        }} className={field} /></label>
        <div className="self-center text-sm"><p>Ganancia neta estimada: <b className="tabular-nums">USD {Number(tp) > 0 ? estimatedTakeProfitNet(p, Number(tp)).toFixed(2) : "–"}</b></p><p className="text-xs text-muted-foreground">Comisión 0,5% (mín. USD 1 por lado) · Impuesto 5%</p></div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2"><Button type="submit" size="sm" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setEditing(false)}>Cancelar</Button></div>
    </form>}
  </div>;
}