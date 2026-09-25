/**
 * Shared shapes for `useActionState`-driven forms.
 *
 * These live outside the `"use server"` action modules on purpose: a file with
 * the `"use server"` directive may only export async functions, so exporting
 * the initial state object from an actions file throws "A 'use server' file
 * can only export async functions, found object" at runtime.
 */

export interface WaitlistActionState {
  status: "idle" | "success" | "error";
  message?: string;
  position?: number;
  email?: string;
}

export const initialWaitlistState: WaitlistActionState = { status: "idle" };

export interface CommentActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const initialCommentState: CommentActionState = { status: "idle" };

export interface QuestSubmissionActionState {
  status: "idle" | "success" | "error";
  message?: string;
  questTitle?: string;
}

export const initialQuestSubmissionState: QuestSubmissionActionState = {
  status: "idle",
};

export interface CollabPostActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const initialCollabPostState: CollabPostActionState = { status: "idle" };

export interface StartupSubmissionActionState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Slug of the created startup, for linking to its showcase page. */
  slug?: string;
  /** The submitted startup's name, for the confirmation screen. */
  startupName?: string;
}

export const initialStartupSubmissionState: StartupSubmissionActionState = {
  status: "idle",
};
