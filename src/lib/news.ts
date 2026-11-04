export const CATEGORIES = [
  { slug: "regional", label: "Regional", desc: "Noticias del Tolima" },
  { slug: "colombia", label: "Colombia", desc: "Noticias nacionales" },
  { slug: "mundo", label: "Mundo", desc: "Noticias internacionales" },
  { slug: "deportes", label: "Deportes", desc: "Actualidad deportiva" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function isCategory(s: string): s is CategorySlug {
  return CATEGORIES.some((c) => c.slug === s);
}

export function categoryLabel(s: string) {
  return CATEGORIES.find((c) => c.slug === s)?.label ?? s;
}

export type News = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  cover_url: string;
  gallery: string[];
  video_url: string | null;
  author: string;
  featured: boolean;
  published_at: string;
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** "04 de Nov, 2026" */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type VideoEmbed =
  { kind: "iframe"; src: string; vertical?: boolean } | { kind: "file"; src: string };

/** Converts a YouTube / Facebook / TikTok / X / MP4 link into an embeddable source. */
export function toVideoEmbed(url: string | null | undefined): VideoEmbed | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;
  if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(u) || u.includes("/storage/v1/object/")) {
    return { kind: "file", src: u };
  }
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  if (/facebook\.com|fb\.watch/i.test(u)) {
    return {
      kind: "iframe",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false`,
    };
  }
  const tt = u.match(/tiktok\.com\/.*video\/(\d+)/i);
  if (tt)
    return { kind: "iframe", src: `https://www.tiktok.com/embed/v2/${tt[1]}`, vertical: true };
  const x = u.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/i);
  if (x)
    return {
      kind: "iframe",
      src: `https://platform.twitter.com/embed/Tweet.html?id=${x[1]}`,
      vertical: true,
    };
  return null;
}

/** Strips HTML for plain-text excerpts. */
export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
