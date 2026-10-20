import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Wallet, LineChart, GraduationCap, Star } from "lucide-react";
import { Section } from "@/components/site";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Simulador de bolsa gratis | Invertí sin poner plata — BolsaPráctica" },
      { name: "description", content: "Paper trading con cotizaciones reales, órdenes límite, stop-loss, take-profit, comisiones e impuestos. Aprendé a invertir sin poner plata." },
      { property: "og:title", content: "Invertí en bolsa sin poner plata — BolsaPráctica" },
      { property: "og:description", content: "Simulador gratuito con datos en tiempo real y gestión de riesgo para practicar sin riesgo." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const features = [
  { icon: Wallet, t: "Capital realista", d: "Elegís tu capital y apalancamiento reales. Nunca ponés un peso." },
  { icon: LineChart, t: "Datos en tiempo real", d: "Market, Limit, Stop-Loss y Take-Profit sobre Apple, NVIDIA, MELI, S&P 500, Bitcoin y más." },
  { icon: GraduationCap, t: "Trading journal", d: "Historial automático con por qué, emociones y capturas de cada operación." },
  { icon: ShieldCheck, t: "Riesgo obligatorio", d: "Máximo 1–2% por operación y ratio mínimo 1:2. Comisiones e impuestos incluidos." },
];

const steps = [
  "Configurá tu capital, apalancamiento, comisiones e impuestos reales.",
  "Operá con Stop-Loss y Take-Profit obligatorios, sin arriesgar más del 2%.",
  "Seguí tus resultados netos con cotizaciones en tiempo real.",
  "Completá tu bitácora: el por qué, capturas y cómo te sentiste.",
];

function Index() {
  return (
    <>
      <div className="bg-hero text-ink-foreground">
        <Section className="py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold">
              <Star className="h-4 w-4 text-accent" /> 100% gratis · Sin tarjeta
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Aprendé a invertir en bolsa <span className="text-primary">sin poner plata</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg opacity-80">
              Paper trading con cotizaciones reales, stop-loss, take-profit, comisiones e impuestos. Configurá el mismo capital que vas a usar de verdad.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/simulador" className="rounded-xl bg-primary px-6 py-4 text-center font-bold text-primary-foreground shadow-cta">
                Empezar a practicar
              </Link>
              <Link to="/tutorial" className="flex items-center justify-center rounded-xl border border-ink-foreground/30 px-6 py-4 font-bold">
                Ver tutorial
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[["Tiempo real", "cotizaciones"], ["1–2%", "riesgo máx."], ["0 USD", "de tu bolsillo"]].map(([a, b]) => (
                <div key={b}><p className="font-display text-2xl font-bold">{a}</p><p className="text-xs opacity-70">{b}</p></div>
              ))}
              </div>
            </div>
        </Section>
      </div>

      <Section className="py-16">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Todo lo que necesitás para empezar</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-10">
        <h2 className="text-3xl font-bold">Cómo funciona</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
              <p className="pt-1.5">{s}</p>
            </li>
          ))}
        </ol>
      </Section>


      <Section className="py-16">
        <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y rounded-2xl border bg-card">
          {[
            ["¿Tengo que poner dinero?", "No. Todo el saldo es virtual. Es un entorno de práctica 100% gratuito."],
            ["¿Los precios son reales?", "Sí. Tomamos las cotizaciones de Yahoo Finance y las refrescamos cada 5 segundos. Lo único ficticio es el dinero."],
            ["¿Necesito saber algo de antes?", "No. En la sección Aprender tenés guías desde cero."],
            ["¿Es asesoramiento financiero?", "No. Es una herramienta educativa. Antes de invertir dinero real, informate con un profesional matriculado."],
          ].map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
