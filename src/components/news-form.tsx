import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bold, Heading2, Italic, List, Quote, Upload, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, slugify, stripHtml, toVideoEmbed, type News } from "@/lib/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function uploadFile(file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("No URL");
  return data.signedUrl;
}

function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cmd = (c: string, arg?: string) => {
    document.execCommand(c, false, arg);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? "");
  };
  const tools = [
    { icon: Bold, label: "Negrita", run: () => cmd("bold") },
    { icon: Italic, label: "Cursiva", run: () => cmd("italic") },
    { icon: Heading2, label: "Subtítulo", run: () => cmd("formatBlock", "<h2>") },
    { icon: List, label: "Lista", run: () => cmd("insertUnorderedList") },
    { icon: Quote, label: "Cita", run: () => cmd("formatBlock", "<blockquote>") },
    {
      icon: Link2,
      label: "Enlace",
      run: () => {
        const url = prompt("Pega el enlace:");
        if (url) cmd("createLink", url);
      },
    },
  ];
  return (
    <div className="overflow-hidden rounded-md border border-input bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted p-1.5">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={t.run}
            className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-card"
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => cmd("formatBlock", "<p>")}
          className="rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-card"
        >
          Párrafo normal
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="article-body min-h-[320px] p-4 text-base outline-none"
      />
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      {value && <img src={value} alt="" className="aspect-video w-full max-w-md rounded-md object-cover" />}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-accent">
          <Upload className="h-4 w-4" /> {busy ? "Subiendo…" : "Subir desde el equipo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                onChange(await uploadFile(f));
              } catch {
                toast.error("No se pudo subir la imagen.");
              }
              setBusy(false);
            }}
          />
        </label>
        <Input placeholder="…o pega la URL de la imagen" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function NewsForm({ initial }: { initial?: News }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "regional");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [author, setAuthor] = useState(initial?.author ?? "Redacción");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [cover, setCover] = useState(initial?.cover_url ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [video, setVideo] = useState(initial?.video_url ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const videoOk = !video || !!toVideoEmbed(video);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Escribe el título de la noticia.");
    if (!cover) return toast.error("Agrega una imagen principal.");
    if (!stripHtml(content)) return toast.error("Escribe el contenido de la noticia.");
    setSaving(true);
    const payload = {
      title: title.trim(),
      category,
      featured,
      author: author.trim() || "Redacción",
      excerpt: excerpt.trim() || stripHtml(content).slice(0, 180),
      cover_url: cover,
      gallery,
      video_url: video.trim() || null,
      content,
    };
    const { error } = initial
      ? await supabase.from("news").update(payload).eq("id", initial.id)
      : await supabase
          .from("news")
          .insert({ ...payload, slug: `${slugify(title)}-${Date.now().toString(36)}` });
    setSaving(false);
    if (error) return toast.error("No se pudo guardar: " + error.message);
    toast.success(initial ? "Noticia actualizada" : "¡Noticia publicada!");
    qc.invalidateQueries();
    navigate({ to: "/admin" });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black">{initial ? "Editar noticia" : "Crear noticia"}</h1>
      <form onSubmit={save} className="mt-8 space-y-8">
        <section className="space-y-5 rounded-lg border border-border bg-card p-6">
          <div>
            <Label htmlFor="title" className="text-base">Título de la noticia</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-12 text-lg" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="cat" className="text-base">Categoría</Label>
              <select
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="author" className="text-base">Autor / Redactor</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-2 h-12" />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gold bg-accent p-4">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5 accent-primary" />
            <span>
              <span className="block font-semibold">Noticia destacada</span>
              <span className="text-sm text-muted-foreground">Aparecerá de primera en la portada.</span>
            </span>
          </label>
          <div>
            <Label htmlFor="excerpt" className="text-base">Resumen corto</Label>
            <Textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-2" placeholder="Una o dos frases que resuman la noticia (opcional)" />
          </div>
        </section>

        <section className="space-y-5 rounded-lg border border-border bg-card p-6">
          <div>
            <Label className="text-base">Imagen principal</Label>
            <div className="mt-2"><ImageField value={cover} onChange={setCover} /></div>
          </div>
          <div>
            <Label className="text-base">Imágenes secundarias (galería)</Label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((g) => (
                <div key={g} className="relative">
                  <img src={g} alt="" className="aspect-video w-full rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setGallery(gallery.filter((x) => x !== g))}
                    className="absolute right-1 top-1 rounded-full bg-ink p-1 text-ink-foreground"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-accent">
                <Upload className="h-4 w-4" /> Subir imágenes
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    try {
                      const urls = await Promise.all(files.map(uploadFile));
                      setGallery((g) => [...g, ...urls]);
                    } catch {
                      toast.error("No se pudo subir alguna imagen.");
                    }
                  }}
                />
              </label>
              <Input placeholder="…o pega una URL" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (galleryUrl.trim()) setGallery([...gallery, galleryUrl.trim()]);
                  setGalleryUrl("");
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="video" className="text-base">Video (opcional)</Label>
            <p className="text-sm text-muted-foreground">Pega un enlace de YouTube, Facebook, TikTok o X, o sube un video corto.</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input id="video" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-accent">
                <Upload className="h-4 w-4" /> {uploadingVideo ? "Subiendo…" : "Subir video"}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploadingVideo(true);
                    try {
                      setVideo(await uploadFile(f));
                    } catch {
                      toast.error("No se pudo subir el video (máx. 50 MB).");
                    }
                    setUploadingVideo(false);
                  }}
                />
              </label>
            </div>
            {!videoOk && <p className="mt-2 text-sm text-destructive">No reconocemos este enlace de video.</p>}
            {video && videoOk && <p className="mt-2 text-sm text-primary">✓ El video se mostrará dentro de la noticia.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <Label className="text-base">Contenido de la noticia</Label>
          <div className="mt-2"><RichEditor value={content} onChange={setContent} /></div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate({ to: "/admin" })}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={saving} className="h-14 px-10 text-base">
            {saving ? "Guardando…" : initial ? "Guardar cambios" : "Publicar Noticia"}
          </Button>
        </div>
      </form>
    </main>
  );
}
