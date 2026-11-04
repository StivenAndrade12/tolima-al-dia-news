import { Link } from "@tanstack/react-router";
import { categoryLabel, formatDate, type News } from "@/lib/news";

export function NewsCard({ news }: { news: News }) {
  return (
    <Link to="/noticia/$slug" params={{ slug: news.slug }} className="group flex flex-col">
      <div className="aspect-video overflow-hidden rounded-md bg-muted">
        <img
          src={news.cover_url}
          alt={news.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <span className="kicker mt-4">{categoryLabel(news.category)}</span>
      <h3 className="mt-1.5 text-xl font-bold leading-snug text-foreground group-hover:text-primary">
        {news.title}
      </h3>
      <time className="mt-2 text-xs text-muted-foreground">{formatDate(news.published_at)}</time>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{news.excerpt}</p>
    </Link>
  );
}

export function FeaturedNews({ news }: { news: News }) {
  return (
    <Link
      to="/noticia/$slug"
      params={{ slug: news.slug }}
      className="group grid gap-6 lg:grid-cols-5 lg:gap-10"
    >
      <div className="aspect-video overflow-hidden rounded-md bg-muted lg:col-span-3">
        <img
          src={news.cover_url}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center lg:col-span-2">
        <div className="flex items-center gap-3">
          <span className="rounded-sm bg-gold px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-gold-foreground">
            Destacada
          </span>
          <span className="kicker">{categoryLabel(news.category)}</span>
        </div>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground group-hover:text-primary md:text-4xl lg:text-5xl">
          {news.title}
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">{news.excerpt}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Por <span className="font-semibold text-foreground">{news.author}</span> ·{" "}
          {formatDate(news.published_at)}
        </p>
      </div>
    </Link>
  );
}
