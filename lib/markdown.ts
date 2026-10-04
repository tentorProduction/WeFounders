/**
 * Intelligent, dependency-free markdown & pitch formatter for WeFounders.
 *
 * Automatically detects:
 * - Bold (**bold**)
 * - Italic (*italic* or _italic_)
 * - Underline (__underlined__ or <u>underlined</u>)
 * - Strikethrough (~~strikethrough~~)
 * - Section titles & headers (headings with #, standalone titles like 'Problem', 'Solution', 'Who is it for?', labels ending with :)
 * - Ordered & unordered lists (including glued numbered items like '1.Basic info 2.Product details')
 * - Cleans out copy-pasted navigation/form wizard junk.
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
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href;
  if (/^\/(?![/\\])/.test(href)) return href;
  return null;
}

/** Inline formatting: code, bold, italic, underline, strike, links. */
export function renderInline(text: string): string {
  // First escape HTML entities
  let out = escapeHtml(text);

  // Inline code
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-[#F0F2F5] px-1.5 py-0.5 font-mono text-[0.85em] text-[#17181B]">$1</code>'
  );

  // Bold (**text**)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-[#17181B]">$1</strong>');

  // Underline (__text__)
  out = out.replace(/__([^_]+)__/g, '<span class="underline underline-offset-4 decoration-[#FF4B3E]/50 text-[#17181B] font-medium">$1</span>');

  // Strikethrough (~~text~~)
  out = out.replace(/~~([^~]+)~~/g, '<del class="line-through opacity-70">$1</del>');

  // Italic (*text* or _text_)
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em class="italic text-[#17181B]/90">$2</em>');
  out = out.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em class="italic text-[#17181B]/90">$2</em>');

  // Markdown links [label](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      const safe = safeHref(href);
      if (!safe) return label;
      return `<a href="${safe}" class="font-semibold text-[#FF4B3E] hover:underline underline-offset-2" target="_blank" rel="noreferrer">${label}</a>`;
    }
  );

  return out;
}

const BLOCK_CLASSES = {
  h2: "mt-6 text-xl font-bold tracking-tight text-[#17181B] first:mt-0 pb-1.5 border-b border-[#F0F2F5]",
  h3: "mt-5 text-base font-bold text-[#17181B] flex items-center gap-2",
  p: "mt-2.5 text-sm leading-relaxed text-[#4B5059]",
  ul: "mt-3 list-disc space-y-1.5 pl-5 text-sm text-[#4B5059]",
  ol: "mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[#4B5059]",
  quote:
    "mt-4 rounded-xl border-l-4 border-[#FF4B3E] bg-[#FFF5F4]/60 p-3.5 text-sm italic text-[#374151]",
  hr: "my-6 border-[#E4E7EB]",
} as const;

// Common heading title words that founders write on standalone lines
const TITLE_REGEX = /^(the\s+)?(problem|solution|who\s+is\s+it\s+for\??|target\s+audience|key\s+features|features|product\s+overview|overview|how\s+it\s+works|why\s+[a-z0-9\s]+|what\s+is\s+[a-z0-9\s]+|beta\s+testing|roadmap|changelog|updates|pricing):?$/i;

// Noise patterns when founders copy-paste form/wizard text
const NOISE_PATTERNS = [
  /^skip to content/i,
  /^wefounders(\s+discover\s+leaderboard)?/i,
  /^draft saved to your account/i,
  /^back\s+continue/i,
  /^administrator access is required/i,
  /^submit your startup\s*·\s*wefounders/i,
  /^dismiss$/i,
];

export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";

  // Normalize line breaks
  let text = markdown.replace(/\r\n/g, "\n");

  // If someone pasted concatenated steps: "1.Basic information 2.Product details 3.Founder"
  // Split them onto separate lines so they become a clean list
  text = text.replace(/(\d+)\.([A-Za-z])/g, "\n$1. $2");

  const lines = text.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const content = paragraph.join(" ").trim();
    if (content) {
      html.push(`<p class="${BLOCK_CLASSES.p}">${renderInline(content)}</p>`);
    }
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed === "") {
      flushParagraph();
      closeList();
      continue;
    }

    // Skip form wizard / copy-pasted UI noise
    if (NOISE_PATTERNS.some((pat) => pat.test(trimmed))) {
      continue;
    }

    // Standard markdown headings #, ##, ###
    const mdHeading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (mdHeading) {
      flushParagraph();
      closeList();
      const level = mdHeading[1].length <= 2 ? "h2" : "h3";
      const className = level === "h2" ? BLOCK_CLASSES.h2 : BLOCK_CLASSES.h3;
      html.push(`<${level} class="${className}">${renderInline(mdHeading[2])}</${level}>`);
      continue;
    }

    // Auto-detect standalone title lines like "Problem", "Solution", "Who is it for?", "Features:"
    if (TITLE_REGEX.test(trimmed) || (/^[A-Z][A-Za-z0-9\s—–-]{2,35}:$/.test(trimmed) && trimmed.length < 40)) {
      flushParagraph();
      closeList();
      const cleanTitle = trimmed.replace(/:$/, "");
      html.push(`<h3 class="${BLOCK_CLASSES.h3}"><span class="h-2 w-2 rounded-full bg-[#FF4B3E]"></span>${renderInline(cleanTitle)}</h3>`);
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push(`<hr class="${BLOCK_CLASSES.hr}" />`);
      continue;
    }

    // Blockquote
    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushParagraph();
      closeList();
      html.push(`<blockquote class="${BLOCK_CLASSES.quote}">${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    // Unordered or ordered list item
    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+\.\s*(.*)$/.exec(trimmed);
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

    // Check if line starts with a bold key/value label like "Problem: creating captions..."
    const keyValMatch = /^([A-Z][A-Za-z0-9\s]{2,25}):\s+(.+)$/.exec(trimmed);
    if (keyValMatch && keyValMatch[1].length < 30) {
      flushParagraph();
      closeList();
      html.push(
        `<p class="${BLOCK_CLASSES.p}"><strong class="font-bold text-[#17181B]">${escapeHtml(keyValMatch[1])}:</strong> ${renderInline(keyValMatch[2])}</p>`
      );
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();

  return html.join("\n");
}
