"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchBarProps {
  className?: string;
  /** Shorter placeholders fit the compact header variant. */
  placeholder?: string;
}

/**
 * Header search input with an instant-search keyboard shortcut (⌘K / Ctrl K).
 * Submitting navigates to /search?q=… — the results page is wired in a
 * later prompt.
 */
export function SearchBar({
  className,
  placeholder = "Search startups, stacks, or founders…",
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [shortcut, setShortcut] = useState("⌘K");

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    setShortcut(isMac ? "⌘K" : "Ctrl K");

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative", className)}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search startups, stacks, or founders"
        className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-body shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:pr-14"
      />
      <kbd
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center rounded border bg-muted px-1.5 py-0.5 font-sans text-tiny font-medium text-muted-foreground sm:inline-flex"
      >
        {shortcut}
      </kbd>
    </form>
  );
}
