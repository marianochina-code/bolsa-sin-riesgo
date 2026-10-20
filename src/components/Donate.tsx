import { useState } from "react";
import { Heart } from "lucide-react";

export const MP_ALIAS = "vito.italia";

export function Donate() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(MP_ALIAS); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <div id="donar" className="mx-auto mt-8 max-w-xl rounded-2xl border bg-card p-8 text-center shadow-card">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
        <Heart className="h-7 w-7 text-primary" />
      </span>
      <h2 className="mt-5 text-2xl font-bold md:text-3xl">Apoyá el proyecto</h2>
      <p className="mt-3 text-muted-foreground">El simulador es gratis. Si te sirve y querés colaborar, podés donar lo que quieras por Mercado Pago.</p>
      <p className="mt-6 text-sm text-muted-foreground">Alias de Mercado Pago</p>
      <p className="font-display text-3xl font-extrabold tracking-tight">{MP_ALIAS}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={copy} className="flex-1 rounded-xl border py-4 font-bold">
          {copied ? "¡Alias copiado!" : "Copiar alias"}
        </button>
        <a href="https://www.mercadopago.com.ar/" target="_blank" rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-cta">
          Abrir Mercado Pago
        </a>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">En Mercado Pago tocá "Transferir", pegá el alias y elegí el monto.</p>
    </div>
  );
}
