import { createFileRoute } from "@tanstack/react-router";
import { Phone, Clock, Mail } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PHONE_DISPLAY, PHONE_TEL, Section } from "@/components/site";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y asesoría gratuita — BolsaPráctica" },
      { name: "description", content: "Llamanos o dejá tus datos y un mentor te ayuda a dar tus primeros pasos en la bolsa con el simulador." },
      { property: "og:title", content: "Contacto y asesoría gratuita — BolsaPráctica" },
      { property: "og:description", content: "Un mentor te guía gratis en tus primeras operaciones de práctica." },
      { property: "og:url", content: "/contacto" },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: Contacto,
});

function Contacto() {
  return (
    <Section className="grid gap-10 py-10 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold md:text-5xl">Hablemos</h1>
        <p className="mt-3 text-lg text-muted-foreground">Te ayudamos a usar el simulador y armar tu primera cartera de práctica. Gratis.</p>
        <a href={PHONE_TEL} className="mt-8 flex items-center gap-3 rounded-2xl bg-primary p-5 font-display text-xl font-bold text-primary-foreground shadow-cta">
          <Phone /> {PHONE_DISPLAY}
        </a>
        <ul className="mt-6 space-y-3 text-muted-foreground">
          <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0" /> Lunes a viernes, 9 a 18 h</li>
          <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0" /> hola@bolsapractica.com</li>
        </ul>
      </div>
      <LeadForm />
    </Section>
  );
}
