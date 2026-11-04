import { describe, expect, it } from "vitest";
import { sanitizeNewsHtml, toVideoEmbed } from "@/lib/news";

describe("sanitizeNewsHtml", () => {
  it("keeps the editor's basic formatting", () => {
    expect(sanitizeNewsHtml("<p>Hola <strong>Tolima</strong></p>")).toBe(
      "<p>Hola <strong>Tolima</strong></p>",
    );
  });

  it("removes executable elements and their contents", () => {
    expect(sanitizeNewsHtml("<p>Antes</p><script>alert(1)</script><p>Después</p>")).toBe(
      "<p>Antes</p><p>Después</p>",
    );
  });

  it("removes event handlers and unsafe link protocols", () => {
    expect(
      sanitizeNewsHtml('<a href="javascript:alert(1)" onclick="alert(2)">enlace</a>'),
    ).toBe("<a>enlace</a>");
  });

  it("keeps safe links but overwrites target and rel attributes", () => {
    expect(
      sanitizeNewsHtml('<a href="https://example.com" target="_self">fuente</a>'),
    ).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">fuente</a>',
    );
  });
});

describe("toVideoEmbed", () => {
  it("rejects non-HTTPS video URLs", () => {
    expect(toVideoEmbed("javascript:alert(1)")).toBeNull();
    expect(toVideoEmbed("http://example.com/video.mp4")).toBeNull();
  });

  it("accepts a valid YouTube video URL", () => {
    expect(toVideoEmbed("https://www.youtube.com/watch?v=aqz-KE-bpKQ")).toEqual({
      kind: "iframe",
      src: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    });
  });
});
