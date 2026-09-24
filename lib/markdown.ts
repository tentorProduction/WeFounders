/**
 * Minimal, dependency-free markdown renderer for startup pitches (PRD §4.1).
 *
 * Security model: every line is HTML-escaped FIRST, then a small, fixed set of
 * block/inline patterns is applied. Raw HTML in user content is therefore
 * never executed, and link hrefs are restricted to http(s)/mailto/relative.
 *
 * TODO: swap for react-markdown + remark-gfm when we need tables, images and
 * nested lists.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href) || href.startsWith("/")) {
    return href;
  }
  return null;
}

/** Inline formatting: code, bold, italic, links. */
function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em]">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_match, label: string, href: string) => {
        const safe = safeHref(href);
        if (!safe) return label;
        return `<a href="${safe}" class="font-medium text-primary underline underline-offset-2" target="_blank" rel="noreferrer">${label}</a>`;
      }
    );
}

const BLOCK_CLASSES = {
  h2: "mt-6 text-h2 font-semibold text-foreground first:mt-0",
  h3: "mt-5 text-body font-semibold text-foreground",
  p: "mt-3 text-body leading-relaxed text-muted-foreground",
  ul: "mt-3 list-disc space-y-1.5 pl-5 text-body text-muted-foreground",
  ol: "mt-3 list-decimal space-y-1.5 pl-5 text-body text-muted-foreground",
  quote:
    "mt-3 border-l-2 border-primary/40 pl-3 text-body italic text-muted-foreground",
  hr: "my-6 border-border",
} as const;

/** Render a markdown string to safe HTML. */
export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(
      `<p class="${BLOCK_CLASSES.p}">${renderInline(paragraph.join(" "))}</p>`
    );
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length <= 2 ? "h2" : "h3";
      const className = level === "h2" ? BLOCK_CLASSES.h2 : BLOCK_CLASSES.h3;
      html.push(
        `<${level} class="${className}">${renderInline(heading[2])}</${level}>`
      );
      continue;
    }

    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push(`<hr class="${BLOCK_CLASSES.hr}" />`);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushParagraph();
      closeList();
      html.push(
        `<blockquote class="${BLOCK_CLASSES.quote}">${renderInline(quote[1])}</blockquote>`
      );
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (bullet || ordered) {
      flushParagraph();
      const wanted = bullet ? "ul" : "ol";
      if (listType !== wanted) {
        closeList();
        listType = wanted;
        html.push(`<${wanted} class="${BLOCK_CLASSES[wanted]}">`);
      }
      html.push(`<li>${renderInline((bullet ?? ordered)![1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();

  return html.join("\n");
}
