import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listNews } from "@/lib/news.functions";
import { NewsListing } from "@/components/news-listing";

const homeQuery = (page: number) =>
  queryOptions({ queryKey: ["news", "home", page], queryFn: () => listNews({ data: { page } }) });

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Number(s.page) > 0 ? Number(s.page) : undefined }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(homeQuery(deps.page)),
  head: () => ({
    meta: [
      { title: "La Voz del Tolima — Noticias del Tolima, Colombia y el mundo" },
      { name: "description", content: "Portal de noticias de la emisora institucional del Tolima: actualidad regional, nacional, internacional y deportes." },
      { property: "og:title", content: "La Voz del Tolima — Noticias" },
      { property: "og:description", content: "Actualidad regional, nacional, internacional y deportes desde el Tolima." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { page } = Route.useLoaderDeps();
  const { data } = useSuspenseQuery(homeQuery(page));
  return <NewsListing items={data.items} page={data.page} pages={data.pages} showFeatured />;
}
