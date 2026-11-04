import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel, formatDate, type News } from "@/lib/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as News[];
    },
  });

  const rows = data.filter(
    (n) => (!cat || n.category === cat) && (!q || n.title.toLowerCase().includes(q.toLowerCase())),
  );

  const remove = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar.");
      return;
    }
    toast.success("Noticia eliminada");
    qc.invalidateQueries();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Noticias publicadas</h1>
          <p className="text-sm text-muted-foreground">{data.length} noticias en total</p>
        </div>
        <Button asChild size="lg">
          <Link to="/admin/nueva">
            <Plus /> Nueva noticia
          </Link>
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por título…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-sm"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Noticia</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Fecha</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Sin resultados
                </td>
              </tr>
            )}
            {rows.map((n) => (
              <tr key={n.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {n.cover_url ? (
                      <img
                        src={n.cover_url}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-20 shrink-0 place-items-center rounded bg-muted text-xs font-serif font-black text-primary/40">
                        V
                      </div>
                    )}
                    <span className="font-semibold">
                      {n.featured && (
                        <span title="Noticia destacada">
                          <Star className="mr-1 inline h-4 w-4 fill-gold text-gold" />
                        </span>
                      )}
                      {n.title}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="kicker">{categoryLabel(n.category)}</span>
                </td>
                <td className="whitespace-nowrap p-3 text-muted-foreground">
                  {formatDate(n.published_at)}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/editar/$id" params={{ id: n.id }}>
                        <Pencil /> Editar
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar esta noticia?</AlertDialogTitle>
                          <AlertDialogDescription>
                            “{n.title}” se eliminará de forma permanente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(n.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
