import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/site";

export const Route = createFileRoute("/tutorial")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Tutorial: cómo usar el simulador de paper trading — BolsaPráctica" },
      { name: "description", content: "Guía paso a paso para crear tu cuenta, configurar capital realista, operar con stop-loss y take-profit y llevar tu trading journal." },
      { property: "og:title", content: "Tutorial del simulador de paper trading" },
      { property: "og:description", content: "Aprendé a usar la web paso a paso para practicar inversiones sin poner plata." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/tutorial" },
    ],
    links: [{ rel: "canonical", href: "/tutorial" }],
  }),
  component: Tutorial,
});

const STEPS: { t: string; body: string[]; tip: string }[] = [
  {
    t: "Creá tu cuenta",
    body: [
      "Tocá \"Ingresar\" arriba a la derecha y elegí \"No tengo cuenta\".",
      "Escribí tu email y una contraseña. Te llega un email: hacé clic en el enlace para confirmar.",
      "Todo lo que hagas (operaciones, historial y bitácora) queda guardado en tu cuenta, en cualquier dispositivo.",
    ],
    tip: "Es 100% gratis. Nunca te vamos a pedir una tarjeta.",
  },
  {
    t: "Configurá una cuenta realista",
    body: [
      "Capital inicial: poné lo mismo que pensás invertir de verdad (por ejemplo USD 1.000).",
      "Apalancamiento: elegí el que te permitiría tu bróker real. Si no sabés, dejá 1:1 (sin apalancamiento).",
      "Comisión e impuestos: copiá los de tu bróker. Se descuentan solos de cada operación.",
      "Riesgo máximo por operación: entre 1% y 2%. Ratio mínimo: 1:2.",
    ],
    tip: "Operar con USD 100.000 ficticios cuando vas a tener 1.000 reales te enseña malos hábitos.",
  },
  {
    t: "Leé la pantalla",
    body: [
      "Arriba ves tu patrimonio, efectivo, margen usado y resultado total.",
      "A la izquierda, la lista de activos con precio en tiempo real y variación del día. Tocá uno para ver su gráfico.",
      "Los precios los provee Yahoo Finance y se refrescan cada 5 segundos.",
      "En el centro, el gráfico minuto a minuto. Cuando tenés una posición, aparecen las líneas de Entrada, SL y TP.",
      "A la derecha, el panel para enviar órdenes.",
    ],
    tip: "Las acciones se mueven en horario de la bolsa de EE.UU. (11:30 a 18 h de Argentina). Bitcoin y Ethereum, las 24 horas.",
  },
  {
    t: "Elegí el tipo de orden",
    body: [
      "Comprar (long): ganás si el precio sube. Vender (short): ganás si el precio baja.",
      "A mercado: se ejecuta ya, al precio actual.",
      "Límite: elegís un precio. La orden queda pendiente y se ejecuta sola si el mercado llega a ese precio.",
    ],
    tip: "Las órdenes límite pendientes las ves en la pestaña \"Órdenes pendientes\" y las podés cancelar.",
  },
  {
    t: "Poné Stop-Loss y Take-Profit",
    body: [
      "Stop-Loss (SL): el precio en el que cerrás automáticamente para cortar la pérdida.",
      "Take-Profit (TP): el precio en el que cerrás automáticamente para asegurar la ganancia.",
      "Son obligatorios. En una compra, el SL va debajo del precio y el TP arriba. En una venta corta, al revés.",
      "Tocá \"Calcular niveles automáticos\" si querés que el simulador te proponga unos.",
    ],
    tip: "Si el TP no está al menos al doble de distancia que el SL (ratio 1:2), la orden se rechaza.",
  },
  {
    t: "Calculá la cantidad",
    body: [
      "El simulador te muestra la cantidad máxima según tu riesgo. Tocá \"Usar\" para cargarla.",
      "Ejemplo: con USD 1.000 y riesgo 1%, podés perder como mucho USD 10. Si comprás a 100 con SL en 95, arriesgás 5 por acción: máximo 2 acciones.",
      "Debajo ves en vivo el riesgo, el máximo permitido, el ratio y el margen que usás.",
    ],
    tip: "Respetar el 1–2% te permite equivocarte muchas veces seguidas sin quemar la cuenta.",
  },
  {
    t: "Escribí el porqué y cómo te sentís",
    body: [
      "Antes de enviar, escribí por qué entrás (ej. \"Ruptura de resistencia\", \"Anuncio de ganancias\").",
      "Elegí tu emoción: tranquilo, ansioso, con miedo, eufórico…",
      "Tocá \"Ejecutar\". La posición aparece en la pestaña \"Posiciones\" con su resultado en vivo.",
    ],
    tip: "Si no podés explicar por qué entrás en una frase, probablemente no deberías entrar.",
  },
  {
    t: "Cerrá y revisá tu bitácora",
    body: [
      "La posición se cierra sola al tocar el SL o el TP, o podés tocar \"Cerrar\" cuando quieras.",
      "En \"Historial\" ves fecha, hora, precio de entrada y salida, comisiones, impuestos y resultado neto.",
      "Tocá \"Bitácora de esta operación\" para subir capturas del gráfico al entrar y al salir y anotar lo que aprendiste.",
      "Con \"Exportar a Excel\" te descargás todo en una planilla.",
    ],
    tip: "Una vez por semana, revisá tu bitácora: buscá patrones (¿perdés más cuando estás ansioso?).",
  },
];

function Tutorial() {
  const [i, setI] = useState(0);
  const s = STEPS[i]!;
  return (
    <Section className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold md:text-5xl">Tutorial: cómo usar la web</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        En 8 pasos aprendés a practicar inversiones en bolsa sin poner plata, con las mismas reglas que vas a usar en el mercado real.
      </p>

      <div className="mt-8 flex gap-1.5" aria-label="Progreso">
        {STEPS.map((_, k) => (
          <button key={k} aria-label={`Paso ${k + 1}`} onClick={() => setI(k)} className={`h-2 flex-1 rounded-full ${k <= i ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <article className="mt-6 rounded-2xl border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm font-bold text-primary">Paso {i + 1} de {STEPS.length}</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">{s.t}</h2>
        <ul className="mt-5 space-y-3">
          {s.body.map((b) => (
            <li key={b} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /><span>{b}</span></li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl bg-secondary p-4 text-sm"><b>Consejo:</b> {s.tip}</p>
        <div className="mt-6 flex justify-between gap-3">
          <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-xl border px-5 py-3 font-bold disabled:opacity-40">Anterior</button>
          {i < STEPS.length - 1 ? (
            <button onClick={() => setI(i + 1)} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-cta">Siguiente</button>
          ) : (
            <Link to="/simulador" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-cta">Ir al simulador</Link>
          )}
        </div>
      </article>

      <h2 className="mt-12 text-2xl font-bold">Todos los pasos</h2>
      <ol className="mt-4 space-y-2">
        {STEPS.map((x, k) => (
          <li key={x.t}>
            <button onClick={() => { setI(k); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full rounded-xl border bg-card px-4 py-3 text-left font-semibold hover:bg-secondary">
              {k + 1}. {x.t}
            </button>
          </li>
        ))}
      </ol>
    </Section>
  );
}
