"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="site-container py-20" role="alert"><h1 className="text-3xl">We couldn’t load this page.</h1><p className="my-6 text-muted-foreground">The service is temporarily unavailable. Your saved work remains in your account.</p><button className="ink-button px-6 py-3" onClick={reset}>Try again</button></section>;
}
