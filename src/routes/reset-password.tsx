import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nueva contraseña — BolsaPráctica" },
      { name: "description", content: "Elegí una nueva contraseña para tu cuenta." },
      { property: "og:title", content: "Nueva contraseña — BolsaPráctica" },
      { property: "og:description", content: "Cambiá tu contraseña." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Section className="max-w-md py-12">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password: pass });
          if (error) setErr(error.message); else nav({ to: "/simulador" });
        }}
        className="space-y-3 rounded-2xl border bg-card p-6 shadow-card"
      >
        <h1 className="text-2xl font-bold">Nueva contraseña</h1>
        <input type="password" required minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3" autoComplete="new-password" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground">Guardar</button>
      </form>
    </Section>
  );
}
