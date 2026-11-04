import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsForm } from "@/components/news-form";
import type { News } from "@/lib/news";

export const Route = createFileRoute("/admin/editar/$id")({ component: EditPage });

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-news", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
      if (error) throw error;
      return data as News;
    },
  });
  if (isLoading) return <p className="p-10 text-center text-muted-foreground">Cargando…</p>;
  if (!data) return <p className="p-10 text-center">Noticia no encontrada.</p>;
  return <NewsForm initial={data} />;
}
