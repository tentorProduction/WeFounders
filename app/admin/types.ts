import type { Startup, StartupWithTags, Tag } from "@/types/database";

export type AdminStartup = StartupWithTags & {
  profiles?: {
    email: string;
    full_name: string;
  } | null;
};

export type AdminStartupRow = Startup & {
  startup_tags?: Array<{ tags: Tag | Tag[] | null }> | null;
  profiles?: { email: string; full_name: string } | null;
};
