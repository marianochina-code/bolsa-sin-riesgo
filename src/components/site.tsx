import { Link } from "@tanstack/react-router";
import { Phone, TrendingUp, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export const PHONE_DISPLAY = "+54 11 5555-0123";
export const PHONE_TEL = "tel:+541155550123";

const nav = [
  { to: "/simulador", label: "Simulador" },
  { to: "/aprender", label: "Aprender" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </span>
          <span className="truncate">BolsaPráctica</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-sm font-semibold text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <a href={PHONE_TEL} className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-cta sm:inline-flex">
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
          <button aria-label="Menú" onClick={() => setOpen(!open)} className="rounded-lg p-2 md:hidden">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-3 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 font-semibold">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-ink pb-24 pt-12 text-ink-foreground md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">BolsaPráctica</p>
          <p className="mt-2 text-sm opacity-70">Aprendé a invertir en bolsa con dinero virtual. Sin riesgo, sin poner un peso.</p>
        </div>
        <div className="text-sm">
          <p className="font-bold">Contacto</p>
          <a href={PHONE_TEL} className="mt-2 block opacity-80 hover:opacity-100">{PHONE_DISPLAY}</a>
          <p className="opacity-70">Lun a Vie · 9 a 18 h</p>
        </div>
        <p className="text-xs opacity-60">
          Plataforma educativa. Los precios del simulador son ficticios y no constituyen asesoramiento financiero ni recomendación de inversión.
        </p>
      </div>
    </footer>
  );
}

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t bg-background p-3 md:hidden">
      <a href={PHONE_TEL} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-cta">
        <Phone className="h-4 w-4" /> Llamar
      </a>
      <Link to="/contacto" className="flex items-center justify-center rounded-xl bg-ink py-3 font-bold text-ink-foreground">
        Pedir asesoría
      </Link>
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</section>;
}
