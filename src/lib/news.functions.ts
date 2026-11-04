import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { News } from "./news";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const PAGE_SIZE = 9;

export const listNews = createServerFn({ method: "GET" })
  .validator((input: { category?: string; page?: number; q?: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const page = Math.max(1, data.page ?? 1);
    let query = sb
      .from("news")
      .select("*", { count: "exact" })
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
    if (data.category) query = query.eq("category", data.category);
    if (data.q) {
      const q = data.q.replace(/[%,()]/g, " ").trim();
      if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }
    const from = (page - 1) * PAGE_SIZE;
    const { data: rows, count, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return {
      items: (rows ?? []) as News[],
      total: count ?? 0,
      page,
      pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    };
  });

export const getNewsBySlug = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: item, error } = await sb
      .from("news")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item) return { item: null, related: [] as News[] };
    const { data: related } = await sb
      .from("news")
      .select("*")
      .eq("category", item.category)
      .neq("id", item.id)
      .order("published_at", { ascending: false })
      .limit(3);
    return { item: item as News, related: (related ?? []) as News[] };
  });
