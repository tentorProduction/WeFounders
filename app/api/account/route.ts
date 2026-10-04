import { member } from "@/lib/platform";
import { getUnreadNotificationsCount } from "@/lib/data/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await member();
  if (!user) return Response.json({ admin: false }, { status: 401 });

  const unreadNotifications = await getUnreadNotificationsCount(user.id);

  return Response.json(
    {
      admin: user.role === "admin",
      profile: `/profile/${user.username}`,
      onboarded: Boolean(user.onboarded_at),
      unreadNotifications,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
