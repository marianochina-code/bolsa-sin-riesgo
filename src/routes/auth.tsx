import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta — BolsaPráctica" },
      { name: "description", content: "Creá tu cuenta gratis para guardar tu cartera de paper trading y tu bitácora." },
      { property: "og:title", content: "Ingresar — BolsaPráctica" },
      { property: "og:description", content: "Guardá tu progreso de paper trading en la nube." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field = "w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setMsg({ ok: false, t: "Email o contraseña incorrectos, o cuenta sin confirmar." });
      else nav({ to: "/simulador" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/simulador` } });
      if (error) setMsg({ ok: false, t: /weak|pwned|guess/i.test(error.message) ? "Esa contraseña es muy fácil de adivinar. Probá con otra más larga y única." : /registered|exists/i.test(error.message) ? "Ya existe una cuenta con ese email. Probá ingresar." : "No se pudo crear la cuenta. Revisá los datos e intentá de nuevo." });
      else setMsg({ ok: true, t: "¡Listo! Revisá tu email y hacé clic en el enlace para confirmar tu cuenta." });
    }
    setBusy(false);
  };

  const reset = async () => {
    if (!email) return setMsg({ ok: false, t: "Escribí tu email primero." });
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMsg({ ok: true, t: "Te enviamos un email para cambiar la contraseña." });
  };

  return (
    <Section className="max-w-md py-12">
      <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
        <h1 className="text-2xl font-bold">{mode === "in" ? "Ingresar" : "Crear cuenta gratis"}</h1>
        <p className="text-sm text-muted-foreground">Tu cartera, historial y bitácora quedan guardados en tu cuenta.</p>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" />
        <input type="password" required minLength={6} placeholder="Contraseña (mín. 6 caracteres)" value={pass} onChange={(e) => setPass(e.target.value)} className={field} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        {msg && <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${msg.ok ? "bg-secondary" : "bg-destructive/10 text-destructive"}`}>{msg.t}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-cta disabled:opacity-60">
          {mode === "in" ? "Ingresar" : "Crear cuenta"}
        </button>
        <div className="flex justify-between text-sm">
          <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="font-semibold text-primary underline">
            {mode === "in" ? "No tengo cuenta" : "Ya tengo cuenta"}
          </button>
          {mode === "in" && <button type="button" onClick={reset} className="text-muted-foreground underline">Olvidé mi contraseña</button>}
        </div>
      </form>
    </Section>
  );
}
