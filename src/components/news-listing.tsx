import { Link } from "@tanstack/react-router";
import type { News } from "@/lib/news";
import { FeaturedNews, NewsCard } from "./news-card";

export function NewsListing({
  items,
  page,
  pages,
  title,
  subtitle,
  showFeatured,
  linkTo,
  search,
}: {
  items: News[];
  page: number;
  pages: number;
  title?: string;
  subtitle?: string;
  showFeatured?: boolean;
  linkTo: string;
  search?: Record<string, string>;
}) {
  const featured = showFeatured && page === 1 ? items[0] : undefined;
  const grid = featured ? items.slice(1) : items;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {title && (
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          <div className="rule-gold mt-4 w-24" />
        </div>
      )}
      {featured && (
        <section className="mb-14 border-b border-border pb-14">
          <FeaturedNews news={featured} />
        </section>
      )}
      {grid.length === 0 && !featured ? (
        <p className="py-20 text-center text-muted-foreground">No hay noticias para mostrar.</p>
      ) : (
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {grid.map((n) => (
            <NewsCard key={n.id} news={n} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="mt-16 flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              to={linkTo}
              search={{ ...search, page: p }}
              className={`grid h-10 w-10 place-items-center rounded-md border text-sm font-semibold transition ${
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
