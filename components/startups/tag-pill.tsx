import { cn } from "@/lib/utils";

const DOT_COLORS: Record<string, string> = {
  // Payment rails
  esewa: "bg-[#6E8B74]",
  khalti: "bg-[#A691A0]",
  fonepay: "bg-[#C85A48]",
  // Localisation
  "sparrow-sms": "bg-[#8C8F94]",
  "ntc-ncell": "bg-[#D98C7B]",
  "devanagari-ui": "bg-[#D98C7B]",
  "nepali-language": "bg-[#D98C7B]",
  "offline-first": "bg-[#8C8F94]",
  // Stacks
  "next-js": "bg-foreground",
  supabase: "bg-[#6E8B74]",
  firebase: "bg-[#D98C7B]",
  flutter: "bg-[#8C8F94]",
  "ai-ml": "bg-[#A691A0]",
  devtools: "bg-muted-foreground",
  // Markets
  "nepal-domestic": "bg-[#D98C7B]",
  "global-export": "bg-[#8C8F94]",
  verified: "bg-[#6E8B74]",
};

export interface TagPillTag {
  name: string;
  slug: string;
}

export interface TagPillProps {
  tag: TagPillTag;
  onSelect?: (tag: TagPillTag) => void;
  onRemove?: () => void;
  active?: boolean;
  className?: string;
}

export function TagPill({
  tag,
  onSelect,
  onRemove,
  active = false,
  className,
}: TagPillProps) {
  const dotClass = DOT_COLORS[tag.slug] ?? "bg-muted-foreground/60";

  const chipClass = cn(
    "inline-flex h-[24px] items-center gap-1.5 rounded-full border px-2.5 text-caption font-medium transition-all",
    active
      ? "border-[#FEC40B] bg-[#FEC40B]/20 text-[#FEC40B] font-semibold"
      : "border-border bg-card text-foreground",
    onSelect &&
      "cursor-pointer hover:border-[#FEC40B]/60 hover:bg-[#FEC40B]/10",
    className
  );

  const label = (
    <>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {tag.name}
    </>
  );

  if (onRemove) {
    return (
      <span className={chipClass}>
        {label}
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 cursor-pointer text-muted-foreground hover:text-foreground font-bold"
          aria-label={`Remove ${tag.name} filter`}
        >
          ×
        </button>
      </span>
    );
  }

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(tag)}
        aria-pressed={active}
        title={`Filter by ${tag.name}`}
        className={chipClass}
      >
        {label}
      </button>
    );
  }

  return <span className={chipClass}>{label}</span>;
}
