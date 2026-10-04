import { cn } from "@/lib/utils";

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
  const chipClass = cn(
    "inline-flex h-[20px] sm:h-[22px] items-center rounded-full border px-2 text-[11px] font-medium leading-none transition-all",
    active
      ? "border-[#FF4B3E] bg-[#FF4B3E]/15 text-[#FF4B3E] font-semibold"
      : "border-[#DADDE1] bg-[#FFFFFF] text-[#4B5059] hover:text-[#17181B] hover:border-[#17181B]",
    onSelect &&
      "cursor-pointer hover:border-[#FF4B3E]/60 hover:bg-[#FF4B3E]/10",
    className
  );

  const label = tag.name;

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
