/**
 * Demo video embed parsing (DESIGN.md §4.2 — "embedded YouTube/Loom demo").
 */

export interface VideoEmbed {
  provider: "youtube" | "loom";
  /** Privacy-friendly embed URL for the iframe. */
  embedUrl: string;
  /** Original URL, used for the "open in new tab" fallback link. */
  watchUrl: string;
}

function cleanId(value: string | undefined | null): string | null {
  if (!value) return null;
  const id = value.replace(/[^A-Za-z0-9_-]/g, "");
  return id.length > 0 ? id : null;
}

/** Parse a YouTube or Loom URL into an embeddable form. */
export function parseVideoEmbed(url?: string | null): VideoEmbed | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = cleanId(parsed.pathname.slice(1));
    return id
      ? {
          provider: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
          watchUrl: url.trim(),
        }
      : null;
  }

  if (host.endsWith("youtube.com")) {
    const fromQuery = cleanId(parsed.searchParams.get("v"));
    const fromPath = cleanId(
      parsed.pathname.startsWith("/embed/")
        ? parsed.pathname.slice("/embed/".length)
        : parsed.pathname.startsWith("/shorts/")
          ? parsed.pathname.slice("/shorts/".length)
          : null
    );
    const id = fromQuery ?? fromPath;
    return id
      ? {
          provider: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
          watchUrl: url.trim(),
        }
      : null;
  }

  if (host.endsWith("loom.com")) {
    const id = cleanId(
      parsed.pathname.startsWith("/share/")
        ? parsed.pathname.slice("/share/".length).split("/")[0]
        : parsed.pathname.startsWith("/embed/")
          ? parsed.pathname.slice("/embed/".length).split("/")[0]
          : null
    );
    return id
      ? {
          provider: "loom",
          embedUrl: `https://www.loom.com/embed/${id}`,
          watchUrl: url.trim(),
        }
      : null;
  }

  return null;
}
