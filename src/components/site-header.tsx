import { Link, useNavigate } from "@tanstack/react-router";
import { Radio, Search, Pause } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/news";

/** Pega aquí la URL del stream de audio cuando esté disponible. */
export const RADIO_STREAM_URL = "";

const NAV = [{ slug: "", label: "Inicio" }, ...CATEGORIES.map((c) => ({ slug: c.slug as string, label: c.label }))];

function NavLink({ slug, className, activeProps, children }: { slug: string; className: string; activeProps?: { className: string }; children: ReactNode }) {
  return slug ? (
    <Link to="/$category" params={{ category: slug }} className={className} activeProps={activeProps}>{children}</Link>
  ) : (
    <Link to="/" activeOptions={{ exact: true, includeSearch: false }} className={className} activeProps={activeProps}>{children}</Link>
  );
}

function RadioButton() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!RADIO_STREAM_URL) {
      toast("La señal en vivo estará disponible muy pronto.");
      return;
    }
    if (!audio.current) audio.current = new Audio(RADIO_STREAM_URL);
    if (playing) audio.current.pause();
    else void audio.current.play();
    setPlaying(!playing);
  };
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
    >
      <span className="live-dot h-2 w-2 rounded-full bg-gold" />
      {playing ? <Pause className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
      Radio en Vivo
    </button>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="capitalize opacity-80">{today}</span>
          <RadioButton />
        </div>
      </div>
      <header className="bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary font-serif text-2xl font-black text-gold">
              V
            </span>
            <span className="leading-none">
              <span className="block font-serif text-2xl font-black tracking-tight text-foreground md:text-3xl">
                La Voz del Tolima
              </span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Radio institucional · Noticias
              </span>
            </span>
          </Link>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) navigate({ to: "/buscar", search: { q: q.trim() } });
            }}
            className="flex w-full items-center rounded-full border border-input bg-background px-4 md:w-80"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar noticias…"
              aria-label="Buscar noticias"
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
          </form>
        </div>
      </header>
      <nav className="sticky top-0 z-40 border-y border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {NAV.map((n) => (
            <NavLink
              key={n.slug}
              slug={n.slug}
              className="whitespace-nowrap border-b-[3px] border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-primary"
              activeProps={{ className: "!border-primary !text-primary" }}
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="rule-gold" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl font-black">La Voz del Tolima</p>
          <p className="mt-2 text-sm opacity-70">Emisora institucional al servicio de la información regional.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {NAV.map((n) => (
            <NavLink key={n.slug} slug={n.slug} className="opacity-80 hover:text-gold">
              {n.label}
            </NavLink>
          ))}
        </div>
        <div className="text-sm opacity-70 md:text-right">
          <p>Ibagué, Tolima · Colombia</p>
          <p className="mt-2">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
