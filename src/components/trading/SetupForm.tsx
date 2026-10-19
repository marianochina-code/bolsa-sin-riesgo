import { useState } from "react";
import { DEFAULT_SETTINGS, MAX_RISK_PCT, type Settings } from "@/lib/trading";

const field = "w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring";

export function SetupForm({ initial, onSave }: { initial?: Settings; onSave: (s: Settings) => void }) {
  const [s, setS] = useState<Settings>(initial ?? DEFAULT_SETTINGS);
  const num = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setS({ ...s, [k]: Number(e.target.value) });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(s); }}
      className="rounded-2xl border bg-card p-6 shadow-card"
    >
      <h2 className="text-2xl font-bold">Configurá tu cuenta realista</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Usá el mismo capital y apalancamiento que vas a tener en tu bróker real. Si cambiás la configuración, la cuenta se reinicia.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <L t="Capital inicial (USD)" h="Lo que realmente vas a invertir">
          <input type="number" min={50} step="any" required value={s.capital} onChange={num("capital")} className={field} />
        </L>
        <L t="Apalancamiento" h="El que te permite tu bróker según tu país">
          <select value={s.leverage} onChange={num("leverage")} className={field}>
            {[1, 2, 3, 5, 10, 20, 30].map((x) => <option key={x} value={x}>1:{x}{x === 1 ? " (sin apalancamiento)" : ""}</option>)}
          </select>
        </L>
        <L t="Comisión por operación (%)" h="Se cobra al entrar y al salir">
          <input type="number" min={0} max={5} step="0.01" value={s.commissionPct} onChange={num("commissionPct")} className={field} />
        </L>
        <L t="Comisión mínima (USD)">
          <input type="number" min={0} step="0.01" value={s.commissionMin} onChange={num("commissionMin")} className={field} />
        </L>
        <L t="Impuesto sobre ganancias (%)" h="Se descuenta de cada operación ganadora">
          <input type="number" min={0} max={50} step="0.1" value={s.taxPct} onChange={num("taxPct")} className={field} />
        </L>
        <L t={`Riesgo máximo por operación (máx. ${MAX_RISK_PCT}%)`} h="Regla del 1% – 2%">
          <select value={s.maxRiskPct} onChange={num("maxRiskPct")} className={field}>
            {[0.5, 1, 1.5, 2].map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </L>
        <L t="Ratio riesgo/beneficio mínimo" h="Nunca menos de 1:2">
          <select value={s.minRR} onChange={num("minRR")} className={field}>
            {[2, 2.5, 3].map((x) => <option key={x} value={x}>1:{x}</option>)}
          </select>
        </L>
      </div>
      <button className="mt-6 w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-cta">
        Crear cuenta de práctica
      </button>
    </form>
  );
}

function L({ t, h, children }: { t: string; h?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {t}
      <div className="mt-1.5">{children}</div>
      {h && <span className="mt-1 block text-xs font-normal text-muted-foreground">{h}</span>}
    </label>
  );
}
