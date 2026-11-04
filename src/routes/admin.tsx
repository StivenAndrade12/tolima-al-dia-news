import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administración — La Voz del Tolima" },
      { name: "description", content: "Gestión de noticias del portal." },
      { property: "og:title", content: "Panel de administración" },
      { property: "og:description", content: "Gestión de noticias del portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function useAdminSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) {
      setIsAdmin(undefined);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: session.user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);
  return { session, isAdmin };
}

function AdminLayout() {
  const { session, isAdmin } = useAdminSession();

  if (session === undefined || (session && isAdmin === undefined)) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Cargando…</div>;
  }
  if (!session) return <LoginScreen />;
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="text-lg font-semibold">Tu cuenta no tiene permisos de administrador.</p>
          <Button className="mt-4" variant="outline" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/admin" className="font-serif text-xl font-black">
            La Voz del Tolima <span className="text-gold">· Panel</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" target="_blank" className="opacity-80 hover:text-gold">
              Ver portal
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="opacity-80 hover:text-gold">
              Salir
            </button>
          </div>
        </div>
        <div className="rule-gold" />
      </header>
      <Outlet />
    </div>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Correo o contraseña incorrectos.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Revisa tu correo para confirmar la cuenta.");
    }
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg bg-card p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary font-serif text-3xl font-black text-gold">
            V
          </span>
          <h1 className="mt-4 text-2xl font-black">Panel de noticias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Ingresa con tu correo y contraseña" : "Crea la cuenta de administración"}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </div>
  );
}
