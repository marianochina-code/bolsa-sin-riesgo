import { useState } from "react";
import type { Journal, Trade } from "@/lib/trading";

export const EMOTIONS = ["Tranquilo / con plan", "Ansioso por cerrar rápido", "Con miedo a perder", "Eufórico / codicioso", "Frustrado / revancha", "Aburrido / impulsivo"];

const fmt = (t: number) => new Date(t).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "medium" });
const exitLabel = { "stop-loss": "Stop-Loss", "take-profit": "Take-Profit", manual: "Manual" };

async function compress(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 900 / img.width);
  const c = document.createElement("canvas");
  c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.7);
}

export function exportCsv(trades: Trade[]) {
  const head = ["Símbolo", "Lado", "Cantidad", "Apertura", "Cierre", "Entrada", "Salida", "Salida por", "Bruto", "Comisiones", "Impuestos", "Neto", "Por qué", "Emoción", "Notas"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = trades.map((t) => [t.symbol, t.side, t.qty, fmt(t.openedAt), fmt(t.closedAt), t.entry, t.exit, exitLabel[t.exitReason], t.gross, t.commissions, t.tax, t.net, t.journal.reason, t.journal.emotion, t.journal.notes]);
  const csv = [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
  a.download = "bitacora-trading.csv"; a.click();
}

export function TradeLog({ trades, onJournal }: { trades: Trade[]; onJournal: (id: string, j: Journal) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!trades.length) return <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Todavía no cerraste operaciones.</p>;
  return (
    <div className="space-y-3">
      {trades.map((t) => (
        <div key={t.id} className="rounded-2xl border bg-card p-4 shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div className="min-w-0 text-sm">
              <p className="font-display font-bold">{t.symbol} · {t.side === "long" ? "Compra" : "Venta corta"} · {t.qty}</p>
              <p className="text-muted-foreground">{fmt(t.openedAt)} → {fmt(t.closedAt)}</p>
              <p className="text-muted-foreground">Entrada {t.entry.toFixed(2)} · Salida {t.exit.toFixed(2)} ({exitLabel[t.exitReason]})</p>
              <p className="text-muted-foreground">Bruto {t.gross.toFixed(2)} · Comisiones −{t.commissions.toFixed(2)} · Impuestos −{t.tax.toFixed(2)}</p>
            </div>
            <p className={`text-right font-display text-lg font-bold tabular-nums ${t.net >= 0 ? "text-success" : "text-destructive"}`}>
              {t.net >= 0 ? "+" : ""}{t.net.toFixed(2)}
            </p>
          </div>
          <button onClick={() => setOpenId(openId === t.id ? null : t.id)} className="mt-2 text-sm font-semibold text-primary underline">
            {openId === t.id ? "Cerrar bitácora" : "Bitácora de esta operación"}
          </button>
          {openId === t.id && <JournalEditor j={t.journal} onSave={(j) => onJournal(t.id, j)} />}
        </div>
      ))}
    </div>
  );
}

function JournalEditor({ j, onSave }: { j: Journal; onSave: (j: Journal) => void }) {
  const [d, setD] = useState(j);
  const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
  const shot = (k: "entryShot" | "exitShot") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setD({ ...d, [k]: await compress(f) });
  };
  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <label className="block text-xs font-semibold">El "por qué"<input value={d.reason} maxLength={300} onChange={(e) => setD({ ...d, reason: e.target.value })} className={`${field} mt-1`} /></label>
      <label className="block text-xs font-semibold">Cómo me sentí
        <select value={d.emotion} onChange={(e) => setD({ ...d, emotion: e.target.value })} className={`${field} mt-1`}>
          <option value="">—</option>{EMOTIONS.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">Análisis psicológico y lecciones
        <textarea rows={3} maxLength={2000} value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} className={`${field} mt-1`} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(["entryShot", "exitShot"] as const).map((k) => (
          <label key={k} className="block text-xs font-semibold">
            Captura al {k === "entryShot" ? "entrar" : "salir"}
            <input type="file" accept="image/*" onChange={shot(k)} className="mt-1 block w-full text-xs" />
            {d[k] && <img src={d[k]} alt={`Gráfico al ${k === "entryShot" ? "entrar" : "salir"}`} className="mt-2 rounded-lg border" />}
          </label>
        ))}
      </div>
      <button onClick={() => onSave(d)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Guardar bitácora</button>
    </div>
  );
}
