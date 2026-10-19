import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/site";

export const Route = createFileRoute("/aprender")({
  head: () => ({
    meta: [
      { title: "Cómo invertir en bolsa desde cero — Guía BolsaPráctica" },
      { name: "description", content: "Qué son las acciones, ETFs, CEDEARs, bonos, diversificación y riesgo. Guía simple para empezar a invertir." },
      { property: "og:title", content: "Cómo invertir en bolsa desde cero" },
      { property: "og:description", content: "Guía simple: acciones, ETFs, CEDEARs, diversificación y riesgo." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/aprender" },
    ],
    links: [{ rel: "canonical", href: "/aprender" }],
  }),
  component: Aprender,
});

const temas = [
  ["¿Qué es una acción?", "Es una pequeña parte de una empresa. Si la empresa crece, el precio suele subir; también puede pagar dividendos."],
  ["¿Qué es un ETF?", "Un fondo que cotiza en bolsa y agrupa muchas acciones. Por ejemplo, SPY replica a las 500 empresas más grandes de EE.UU."],
  ["¿Qué son los CEDEARs?", "Certificados que se operan en Argentina en pesos y representan acciones extranjeras como Apple o Coca-Cola."],
  ["Bonos y renta fija", "Le prestás dinero a un gobierno o empresa a cambio de intereses. Suelen ser menos volátiles que las acciones."],
  ["Diversificación", "No pongas todo en una sola empresa. Repartir entre sectores y activos reduce el riesgo."],
  ["Horizonte y riesgo", "Cuanto más largo tu plazo, más volatilidad podés tolerar. Invertí solo dinero que no vas a necesitar pronto."],
  ["Costos y comisiones", "Los brokers cobran comisiones y hay impuestos. Compararlos es parte de invertir bien."],
  ["Errores comunes", "Comprar por moda, vender por pánico y no tener un plan. El simulador es ideal para detectarlos sin perder dinero."],
];

function Aprender() {
  return (
    <Section className="py-10">
      <h1 className="text-3xl font-bold md:text-5xl">Cómo invertir en bolsa desde cero</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Los conceptos clave que enseñan los brokers y escuelas de inversión, resumidos y en criollo.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {temas.map(([t, d]) => (
          <article key={t} className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold">{t}</h2>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-2xl bg-ink p-8 text-center text-ink-foreground">
        <p className="font-display text-2xl font-bold">Lo mejor es practicar</p>
        <Link to="/simulador" className="mt-4 inline-block rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-cta">Abrir el simulador</Link>
      </div>
    </Section>
  );
}
