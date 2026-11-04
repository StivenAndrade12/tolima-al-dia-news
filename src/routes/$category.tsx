import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listNews } from "@/lib/news.functions";
import { NewsListing } from "@/components/news-listing";
import { CATEGORIES, isCategory } from "@/lib/news";

const catQuery = (category: string, page: number) =>
  queryOptions({
    queryKey: ["news", "cat", category, page],
    queryFn: () => listNews({ data: { category, page } }),
  });

export const Route = createFileRoute("/$category")({
  validateSearch: (s: Record<string, unknown>): { page?: number } =>
    Number(s["page"]) > 0 ? { page: Number(s["page"]) } : {},
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, params, deps }) => {
    if (!isCategory(params.category)) throw notFound();
    return context.queryClient.ensureQueryData(catQuery(params.category, deps.page));
  },
  head: ({ params }) => {
    const c = CATEGORIES.find((x) => x.slug === params.category);
    const title = c ? `${c.label} — La Voz del Tolima` : "Sección no encontrada";
    const desc = c ? `${c.desc}: últimas noticias de ${c.label} en La Voz del Tolima.` : "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { page } = Route.useLoaderDeps();
  const { data } = useSuspenseQuery(catQuery(category, page));
  const c = CATEGORIES.find((x) => x.slug === category)!;
  return <NewsListing items={data.items} page={data.page} pages={data.pages} title={c.label} subtitle={c.desc} showFeatured />;
}
