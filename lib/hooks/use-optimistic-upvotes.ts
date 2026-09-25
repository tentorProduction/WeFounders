"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Optimistic upvote engine (PRD §4.1, TRD §5).
 *
 * Toggling a vote updates the UI immediately, then persists in two layers:
 *  1. localStorage — instant, survives reloads, works signed-out (Nepal's
 *     low-bandwidth reality: the feed stays usable offline).
 *  2. Supabase `upvotes`, via POST /api/upvotes — signed-in viewers only. The
 *     `upvotes_counter` trigger owns the totals, so a dropped request self-heals
 *     on the next feed load.
 */

const VOTES_STORAGE_KEY = "wefounder.votes";

type VoteRecord = Record<string, boolean>;

export interface UpvoteView {
  /** Server count plus this viewer's optimistic delta. */
  count: number;
  voted: boolean;
  /** A remote sync is in flight for this startup. */
  pending: boolean;
}

function readStoredVotes(): VoteRecord {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const record: VoteRecord = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === true) record[key] = true;
    }
    return record;
  } catch {
    return {};
  }
}

function writeStoredVotes(votes: VoteRecord): void {
  try {
    window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // Storage disabled (private mode) — optimistic state still works in-session.
  }
}

/**
 * Best-effort remote sync against the `upvotes` table (TRD §2, table 6).
 * A 401 simply means the visitor is signed out — their vote stays on the
 * device, which is expected rather than an error.
 */
async function syncUpvoteWithRemote(startupId: string, voted: boolean): Promise<void> {
  try {
    await fetch("/api/upvotes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startupId, voted }),
      credentials: "same-origin",
    });
  } catch {
    // Non-fatal: the optimistic vote stays, and the count reconciles from the
    // `upvotes` table on the next feed load.
  }
}

export interface UseOptimisticUpvotesResult {
  /** View state for a startup — pass its server upvote count. */
  getUpvote: (startupId: string, baseCount: number) => UpvoteView;
  /** Flip the viewer's vote; updates the UI before any network call. */
  toggleUpvote: (startupId: string) => void;
}

export function useOptimisticUpvotes(): UseOptimisticUpvotesResult {
  const [votes, setVotes] = useState<VoteRecord>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const votesRef = useRef<VoteRecord>({});

  // Restore device-local votes after hydration (keeps SSR markup stable).
  useEffect(() => {
    const stored = readStoredVotes();
    if (Object.keys(stored).length > 0) {
      votesRef.current = stored;
      setVotes(stored);
    }
  }, []);

  const toggleUpvote = useCallback((startupId: string) => {
    const nextVoted = !votesRef.current[startupId];
    const nextVotes: VoteRecord = { ...votesRef.current };

    if (nextVoted) {
      nextVotes[startupId] = true;
    } else {
      delete nextVotes[startupId];
    }

    // 1. Optimistic UI + local persistence happen before anything async.
    votesRef.current = nextVotes;
    setVotes(nextVotes);
    writeStoredVotes(nextVotes);

    // 2. Remote reconciliation, tracked as pending state on the button.
    setPending((current) => ({ ...current, [startupId]: true }));
    void syncUpvoteWithRemote(startupId, nextVoted).finally(() => {
      setPending((current) => ({ ...current, [startupId]: false }));
    });
  }, []);

  const getUpvote = useCallback(
    (startupId: string, baseCount: number): UpvoteView => ({
      count: baseCount + (votes[startupId] ? 1 : 0),
      voted: Boolean(votes[startupId]),
      pending: Boolean(pending[startupId]),
    }),
    [votes, pending]
  );

  return { getUpvote, toggleUpvote };
}
