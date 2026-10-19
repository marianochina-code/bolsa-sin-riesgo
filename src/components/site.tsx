import { Link } from "@tanstack/react-router";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";


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
          <Link to="/simulador" className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-cta sm:inline-flex">
            Abrir simulador
          </Link>
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
        <div className="text-sm"><p className="font-bold">Contacto</p><Link to="/contacto" className="mt-2 block opacity-80 hover:opacity-100">Escribinos</Link></div>
        <p className="text-xs opacity-60">
          Plataforma educativa. Los precios del simulador son ficticios y no constituyen asesoramiento financiero ni recomendación de inversión.
        </p>
      </div>
    </footer>
  );
}

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-3 md:hidden">
      <Link to="/simulador" className="flex items-center justify-center rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-cta">
        Practicar ahora gratis
      </Link>
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</section>;
}
