import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listNews } from "@/lib/news.functions";
import { NewsListing } from "@/components/news-listing";

const searchQuery = (q: string, page: number) =>
  queryOptions({
    queryKey: ["news", "search", q, page],
    queryFn: () => listNews({ data: { q, page } }),
  });

export const Route = createFileRoute("/buscar")({
  validateSearch: (s: Record<string, unknown>): { q?: string; page?: number } => ({
    q: typeof s["q"] === "string" ? s["q"] : "",
    ...(Number(s["page"]) > 0 ? { page: Number(s["page"]) } : {}),
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", page: search.page ?? 1 }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(searchQuery(deps.q, deps.page)),
  head: () => ({
    meta: [
      { title: "Buscar noticias — La Voz del Tolima" },
      { name: "description", content: "Busca noticias en el archivo de La Voz del Tolima." },
      { property: "og:title", content: "Buscar noticias — La Voz del Tolima" },
      { property: "og:description", content: "Busca noticias en el archivo de La Voz del Tolima." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, page } = Route.useLoaderDeps();
  const { data } = useSuspenseQuery(searchQuery(q, page));
  return (
    <NewsListing
      items={data.items}
      page={data.page}
      pages={data.pages}
      title={`Resultados para “${q}”`}
      subtitle={`${data.total} noticia${data.total === 1 ? "" : "s"} encontrada${data.total === 1 ? "" : "s"}`}
      search={{ q }}
    />
  );
}
