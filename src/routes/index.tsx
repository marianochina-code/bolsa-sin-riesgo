import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Wallet, LineChart, GraduationCap, Phone, Star } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PHONE_DISPLAY, PHONE_TEL, Section } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de bolsa gratis | Invertí sin poner plata — BolsaPráctica" },
      { name: "description", content: "Practicá inversiones en acciones y ETFs con USD 10.000 virtuales. Aprendé a invertir en bolsa sin riesgo y con asesoría gratuita." },
      { property: "og:title", content: "Invertí en bolsa sin poner plata — BolsaPráctica" },
      { property: "og:description", content: "Simulador gratuito con USD 10.000 virtuales para aprender a invertir sin riesgo." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const features = [
  { icon: Wallet, t: "USD 10.000 virtuales", d: "Empezás con saldo ficticio. Nunca ponés un peso real." },
  { icon: LineChart, t: "Mercado simulado", d: "Comprá y vendé Apple, NVIDIA, MercadoLibre, el S&P 500 y más." },
  { icon: GraduationCap, t: "Guías paso a paso", d: "Qué es una acción, un ETF, la diversificación y el riesgo." },
  { icon: ShieldCheck, t: "Cero riesgo", d: "Equivocate todo lo que quieras: es la mejor forma de aprender." },
];

const steps = [
  "Abrí el simulador: no hace falta registrarse.",
  "Elegí acciones o ETFs y comprá con tu saldo virtual.",
  "Seguí tus ganancias y pérdidas en tiempo real.",
  "Cuando te sientas listo, hablá con un mentor.",
];

function Index() {
  return (
    <>
      <div className="bg-hero text-ink-foreground">
        <Section className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold">
              <Star className="h-4 w-4 text-accent" /> 100% gratis · Sin tarjeta
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Aprendé a invertir en bolsa <span className="text-primary">sin poner plata</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg opacity-80">
              Practicá con USD 10.000 virtuales en un mercado simulado. Ganá experiencia real antes de arriesgar tu dinero.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/simulador" className="rounded-xl bg-primary px-6 py-4 text-center font-bold text-primary-foreground shadow-cta">
                Empezar a practicar
              </Link>
              <a href={PHONE_TEL} className="flex items-center justify-center gap-2 rounded-xl border border-ink-foreground/30 px-6 py-4 font-bold">
                <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[["+12.000", "alumnos"], ["4,9/5", "valoración"], ["0 USD", "de riesgo"]].map(([a, b]) => (
                <div key={b}><p className="font-display text-2xl font-bold">{a}</p><p className="text-xs opacity-70">{b}</p></div>
              ))}
            </div>
          </div>
          <LeadForm />
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

      <Section className="grid gap-10 py-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold">Cómo funciona</h2>
          <ol className="mt-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <p className="pt-1.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl bg-ink p-8 text-ink-foreground">
          <p className="font-display text-2xl font-bold">¿Tenés dudas? Te llamamos.</p>
          <p className="mt-2 opacity-75">Un mentor te explica cómo usar el simulador y armar tu primera cartera de práctica.</p>
          <a href={PHONE_TEL} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-cta">
            <Phone className="h-5 w-5" /> Llamar ahora
          </a>
          <Link to="/contacto" className="mt-3 block text-center font-semibold underline">o dejanos tus datos</Link>
        </div>
      </Section>

      <Section className="py-16">
        <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y rounded-2xl border bg-card">
          {[
            ["¿Tengo que poner dinero?", "No. Todo el saldo es virtual. Es un entorno de práctica 100% gratuito."],
            ["¿Los precios son reales?", "Son precios simulados que se mueven como un mercado real, para que practiques sin riesgo."],
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
