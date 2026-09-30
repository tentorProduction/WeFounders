"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "wf_analytics_consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function CookieConsent({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const validMeasurementId = measurementId && /^G-[A-Z0-9]+$/i.test(measurementId) ? measurementId : null;
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved === "accepted" || saved === "rejected") setConsent(saved);
      else setShowPreferences(true);
    } catch {
      setShowPreferences(true);
    }

    const openPreferences = () => setShowPreferences(true);
    window.addEventListener("wf:open-cookie-settings", openPreferences);
    return () => window.removeEventListener("wf:open-cookie-settings", openPreferences);
  }, []);

  const saveChoice = (choice: "accepted" | "rejected") => {
    setConsent(choice);
    setShowPreferences(false);
    try { localStorage.setItem(CONSENT_KEY, choice); } catch { /* Consent applies for this view. */ }
  };

  if (!validMeasurementId || isAdmin) return null;

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script id="google-analytics-consent" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',${JSON.stringify(validMeasurementId)});`,
          }} />
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validMeasurementId)}`} strategy="afterInteractive" />
        </>
      )}
      {showPreferences && (
        <aside aria-label="Cookie preferences" className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[105] mx-auto max-w-lg rounded-xl border border-border bg-background p-4 text-foreground shadow-xl md:bottom-4">
          <p className="font-semibold">Your privacy choices</p>
          <p className="mt-1 text-sm text-muted-foreground">Essential sign-in storage is always on. Optional Google Analytics helps us understand site usage and loads only if you allow it. Read our <Link className="text-primary underline underline-offset-2" href="/privacy">Privacy Policy</Link>.</p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => saveChoice("rejected")} className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium hover:bg-secondary">Reject optional</button>
            <button type="button" onClick={() => saveChoice("accepted")} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Allow analytics</button>
          </div>
        </aside>
      )}
    </>
  );
}
