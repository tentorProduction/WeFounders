import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="site-container flex min-h-[55vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-sm text-primary">404 · PAGE NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">This launch link went quiet.</h1>
      <p className="mt-3 text-muted-foreground">The page may have moved, or the address may be mistyped.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/"><Compass className="mr-1.5 h-4 w-4" />Explore launches</Link></Button>
        <Button asChild variant="outline"><Link href="/search"><Search className="mr-1.5 h-4 w-4" />Search</Link></Button>
      </div>
    </section>
  );
}
