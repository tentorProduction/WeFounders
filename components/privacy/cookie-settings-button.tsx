"use client";

export function CookieSettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event("wf:open-cookie-settings"))} className="underline underline-offset-4 hover:text-foreground">Cookie settings</button>;
}
