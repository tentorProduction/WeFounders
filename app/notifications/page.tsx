import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/data/notifications";
import { markAllNotificationsReadAction } from "@/actions/notifications";
import { Bell, Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications — WeFounders",
  description: "Stay updated on launches, comments, testing quests, and karma earnings.",
};

export default async function NotificationsPage() {
  const session = await readSession();
  if (!session) {
    redirect("/sign-in");
  }

  const notifications = await getUserNotifications(session.userId);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="site-container py-8 sm:py-12 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#DADDE1] pb-6">
        <div>
          <h1 className="font-archivo text-2xl sm:text-3xl font-bold text-[#17181B] tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#666A73]">
            Activity, testing updates, and community alerts for your account.
          </p>
        </div>

        {unreadCount > 0 && (
          <form
            action={async () => {
              "use server";
              await markAllNotificationsReadAction();
            }}
          >
            <button
              type="submit"
              className="text-xs font-semibold text-[#FF4B3E] hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#FFF5F4]"
            >
              <Check size={14} weight="bold" />
              <span>Mark all as read</span>
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-[#DADDE1] rounded-[24px] p-12 text-center space-y-3">
          <Bell size={36} className="mx-auto text-[#A0A4AB]" />
          <h3 className="font-archivo text-base font-bold text-[#17181B]">
            All caught up!
          </h3>
          <p className="text-xs text-[#666A73] max-w-sm mx-auto">
            When founders post updates, testers finish quests, or you receive feedback, notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#DADDE1] rounded-[24px] divide-y divide-[#DADDE1] overflow-hidden shadow-xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !n.is_read ? "bg-[#FFF8F7]/60" : "hover:bg-[#F8F9FA]"
              }`}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                  !n.is_read ? "bg-[#FF4B3E]" : "bg-transparent"
                }`}
              />

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#17181B]">{n.title}</h4>
                  <span className="text-[11px] text-[#A0A4AB] shrink-0">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[#666A73] leading-relaxed">{n.message}</p>

                {n.link && (
                  <div className="pt-1.5">
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4B3E] hover:underline"
                    >
                      <span>View details</span>
                      <ArrowRight size={12} weight="bold" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
