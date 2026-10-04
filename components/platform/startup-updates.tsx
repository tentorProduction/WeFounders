import { getStartupUpdates } from "@/lib/data/updates";
import { GitCommit } from "@phosphor-icons/react/dist/ssr";

export async function StartupUpdatesList({ startupId }: { startupId: string }) {
  const updates = await getStartupUpdates(startupId);

  if (updates.length === 0) {
    return null;
  }

  return (
    <section aria-label="Product Changelog" className="rounded-2xl border border-[#DADDE1] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center gap-2">
        <GitCommit size={20} weight="bold" className="text-[#FF4B3E]" />
        <h2 className="font-archivo text-lg font-bold text-[#17181B]">Product Changelog & Updates</h2>
      </div>

      <div className="space-y-4 divide-y divide-[#F0F2F5]">
        {updates.map((update) => (
          <div key={update.id} className="pt-4 first:pt-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#17181B] text-white">
                  {update.version}
                </span>
                <h3 className="font-archivo text-sm font-bold text-[#17181B]">{update.title}</h3>
              </div>
              <span className="text-[11px] text-[#A0A4AB]">
                {new Date(update.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-[#666A73] leading-relaxed whitespace-pre-line">{update.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
