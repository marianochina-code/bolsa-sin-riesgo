import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Section } from "@/components/site";
import { Donate } from "@/components/Donate";

const PHONE_DISPLAY = "11 3190-9003";
const WHATSAPP_HREF =
  "https://wa.me/541131909003?text=" + encodeURIComponent("Hola, tengo una consulta sobre el simulador de bolsa");

export const Route = createFileRoute("/contacto")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contacto por WhatsApp — BolsaPráctica" },
      { name: "description", content: "Escribinos por WhatsApp al 11 3190-9003 para resolver tus dudas sobre el simulador de paper trading." },
      { property: "og:title", content: "Contacto por WhatsApp — BolsaPráctica" },
      { property: "og:description", content: "Escribinos por WhatsApp al 11 3190-9003 para resolver tus dudas sobre el simulador de paper trading." },
      { property: "og:url", content: "/contacto" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          <MessageCircle className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-3xl font-bold md:text-4xl">Contacto</h1>
        <p className="mt-3 text-muted-foreground">¿Dudas para usar el simulador? Escribime por WhatsApp y te ayudo.</p>
        <p className="mt-7 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{PHONE_DISPLAY}</p>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-cta transition hover:brightness-105"
        >
          <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
        </a>
      </div>
      <Donate />
    </Section>
  );
}
