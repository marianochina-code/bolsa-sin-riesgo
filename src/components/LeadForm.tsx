import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function LeadForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-display text-xl font-bold">¡Solicitud recibida!</p>
        <p className="mt-1 text-sm text-muted-foreground">Te contactamos en menos de 24 h hábiles.</p>
      </div>
    );
  const field = "w-full rounded-xl border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="space-y-3 rounded-2xl bg-card p-6 text-card-foreground shadow-card"
    >
      <p className="font-display text-xl font-bold">Pedí tu asesoría gratuita</p>
      <p className="text-sm text-muted-foreground">Un mentor te guía en tus primeras operaciones de práctica.</p>
      <input required maxLength={80} name="nombre" placeholder="Nombre" className={field} />
      <input required type="tel" maxLength={30} name="telefono" placeholder="Teléfono / WhatsApp" className={field} />
      <input required type="email" maxLength={120} name="email" placeholder="Email" className={field} />
      <select name="nivel" className={field} defaultValue="">
        <option value="" disabled>Tu nivel de experiencia</option>
        <option>Nunca invertí</option>
        <option>Invertí un poco</option>
        <option>Tengo experiencia</option>
      </select>
      <button className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-cta transition hover:brightness-105">
        Quiero empezar gratis
      </button>
      <p className="text-center text-xs text-muted-foreground">Sin costo. Sin tarjeta. Sin compromiso.</p>
    </form>
  );
}
