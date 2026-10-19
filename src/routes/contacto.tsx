import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Section } from "@/components/site";

const PHONE_DISPLAY = "11 3190-9003";
const PHONE_HREF = "tel:+541131909003";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — BolsaPráctica" },
      { name: "description", content: "Llamanos al 11 3190-9003 para resolver tus dudas sobre el simulador de paper trading." },
      { property: "og:title", content: "Contacto — BolsaPráctica" },
      { property: "og:description", content: "Llamanos al 11 3190-9003 para resolver tus dudas sobre el simulador de paper trading." },
      { property: "og:url", content: "/contacto" },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: Contacto,
});

function Contacto() {
  return (
    <Section className="py-14 md:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
          <Phone className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-3xl font-bold md:text-4xl">Contacto</h1>
        <p className="mt-3 text-muted-foreground">¿Dudas para usar el simulador? Llamame y te ayudo.</p>
        <p className="mt-7 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{PHONE_DISPLAY}</p>
        <a
          href={PHONE_HREF}
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-cta transition hover:brightness-105"
        >
          <Phone className="h-5 w-5" /> Llamar ahora
        </a>
      </div>
    </Section>
  );
}
