"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseVideoEmbed } from "@/lib/video";
import type { StartupMedia } from "@/types/database";

/** Light, low-noise backdrops for media that isn't uploaded yet. */
const PLACEHOLDER_BACKDROPS = [
  "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.12), transparent 58%), linear-gradient(145deg, #FEF2F2, #FFFFFF 55%, #F4F4F5)",
  "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.1), transparent 58%), linear-gradient(145deg, #FFFFFF, #FEF2F2 55%, #F4F4F5)",
  "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.09), transparent 58%), linear-gradient(145deg, #F4F4F5, #FFFFFF 55%, #FEF2F2)",
  "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.11), transparent 58%), linear-gradient(145deg, #FEF2F2, #F4F4F5 55%, #FFFFFF)",
  "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.1), transparent 58%), linear-gradient(145deg, #FFFFFF, #F4F4F5 55%, #FEF2F2)",
];

export interface StartupGalleryProps {
  startupName: string;
  media: StartupMedia[];
  videoUrl?: string | null;
  className?: string;
}

interface Slide {
  key: string;
  kind: "image" | "video";
  caption: string;
  url: string;
  backdrop: string;
}

/**
 * Screenshot & demo gallery (DESIGN.md §4.2): responsive 16:9 carousel with
 * arrow + dot navigation and an embedded YouTube/Loom demo slide.
 */
export function StartupGallery({
  startupName,
  media,
  videoUrl,
  className,
}: StartupGalleryProps) {
  const embed = parseVideoEmbed(videoUrl);
  const [index, setIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const slides: Slide[] = [
    ...(embed
      ? [
          {
            key: "demo",
            kind: "video" as const,
            caption: `${startupName} demo walkthrough`,
            url: embed.embedUrl,
            backdrop: PLACEHOLDER_BACKDROPS[0],
          },
        ]
      : []),
    ...media
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map((item, position) => ({
        key: item.id,
        kind: "image" as const,
        caption: item.caption ?? `${startupName} screenshot ${position + 1}`,
        url: item.media_url,
        backdrop: PLACEHOLDER_BACKDROPS[(position + 1) % PLACEHOLDER_BACKDROPS.length],
      })),
  ];

  if (slides.length === 0) return null;

  const current = slides[Math.min(index, slides.length - 1)];
  const imageFailed = failedImages.includes(current.key);
  const go = (next: number) =>
    setIndex((next + slides.length) % slides.length);

  return (
    <section aria-label={`${startupName} gallery`} className={cn(className)}>
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-xl border bg-card"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(index + 1);
          if (event.key === "ArrowLeft") go(index - 1);
        }}
      >
        {current.kind === "video" ? (
          <iframe
            key={current.key}
            src={current.url}
            title={current.caption}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : current.url && !imageFailed ? (
          <Image
            key={current.key}
            src={current.url}
            alt={current.caption}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            onError={() => setFailedImages((failed) => [...failed, current.key])}
          />
        ) : (
          <div
            key={current.key}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"
            style={{ backgroundImage: current.backdrop }}
          >
            <Play className="h-6 w-6 text-[#DC2626]/70" aria-hidden />
            <p className="px-6 text-caption font-medium text-[#18181B]">
              {imageFailed ? "Preview unavailable" : "Product preview coming soon"}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(220,38,38,0.2)] bg-[#FFFFFF]/90 px-3 py-1 text-tiny font-mono font-bold text-[#991B1B]">
              MEDIA PREVIEW
            </div>
          </div>
        )}

        {/* Caption bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent p-3">
          <p className="truncate text-caption font-medium text-white">
            {current.caption}
          </p>
          <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-tiny text-white/80">
            {Math.min(index, slides.length - 1) + 1} / {slides.length}
          </span>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {slides.map((slide, position) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Go to slide ${position + 1}`}
              aria-current={position === index}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all",
                position === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
