import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getNewsBySlug } from "@/lib/news.functions";
import { sanitizeNewsHtml } from "@/lib/news";
import { categoryLabel, formatDate, toVideoEmbed } from "@/lib/news";
import { NewsCard } from "@/components/news-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const detailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", "detail", slug],
    queryFn: () => getNewsBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/noticia/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(detailQuery(params.slug));
    if (!res.item) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const n = loaderData?.item;
    if (!n)
      return { meta: [{ title: "Noticia no disponible" }, { name: "robots", content: "noindex" }] };
    const meta = [
      { title: `${n.title} — La Voz del Tolima` },
      { name: "description", content: n.excerpt },
      { name: "author", content: n.author },
      { property: "og:site_name", content: "La Voz del Tolima" },
      { property: "og:title", content: n.title },
      { property: "og:description", content: n.excerpt },
      { property: "og:type", content: "article" },
      { property: "article:published_time", content: n.published_at },
      { property: "article:author", content: n.author },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: n.title },
      { name: "twitter:description", content: n.excerpt },
    ];
    if (n.cover_url.startsWith("https://")) {
      meta.push(
        { property: "og:image", content: n.cover_url },
        { name: "twitter:image", content: n.cover_url },
      );
    }
    const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\\/+$/, "");
    return {
      meta,
      links: siteUrl ? [{ rel: "canonical", href: `${siteUrl}/noticia/${n.slug}` }] : [],
    };
  },
  component: Article,
});

function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://x.com/intent/tweet?text=${t}&url=${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Compartir
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

function Article() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(slug));
  const n = data.item!;
  const video = toVideoEmbed(n.video_url);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <article className="mx-auto max-w-3xl">
        <Link to="/$category" params={{ category: n.category }} className="kicker hover:underline">
          {categoryLabel(n.category)}
        </Link>
        <h1 className="mt-3 text-4xl font-black leading-[1.1] text-foreground md:text-5xl">
          {n.title}
        </h1>
        <p className="mt-5 text-lg text-muted-foreground md:text-xl">{n.excerpt}</p>
        <div className="mt-6 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Por <span className="font-semibold text-foreground">{n.author}</span> ·{" "}
            {formatDate(n.published_at)}
          </p>
          <ShareButtons title={n.title} />
        </div>
      </article>

      {n.cover_url && (
        <figure className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-md">
          <img src={n.cover_url} alt={n.title} decoding="async" className="aspect-video w-full object-cover" />
        </figure>
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(n.content) }} />

        {video && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Video</h2>
            {video.kind === "file" ? (
              <video src={video.src} controls className="w-full rounded-md bg-ink" />
            ) : (
              <div
                className={`overflow-hidden rounded-md bg-ink ${video.vertical ? "mx-auto aspect-[9/16] max-w-sm" : "aspect-video"}`}
              >
                <iframe
                  src={video.src}
                  title="Video de la noticia"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </section>
        )}

        {n.gallery.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Galería</h2>
            <Carousel className="mx-12">
              <CarouselContent>
                {n.gallery.map((src) => (
                  <CarouselItem key={src}>
                    <img src={src} alt="" loading="lazy" decoding="async" className="aspect-video w-full rounded-md object-cover" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        <div className="mt-10 border-t border-border pt-6">
          <ShareButtons title={n.title} />
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-black">Noticias relacionadas</h2>
          <div className="rule-gold mb-8 mt-3 w-24" />
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {data.related.map((r) => (
              <NewsCard key={r.id} news={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
