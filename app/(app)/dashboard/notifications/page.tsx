import { getNotificationsAction, markAllReadAction, markReadAction } from "./actions";

export default async function NotificationsPage() {
  const { notifications } = await getNotificationsAction();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllReadAction}>
            <button type="submit" className="text-[13px] text-blue hover:underline">
              Mark all read
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-card border border-border px-4 py-3 ${n.read ? "bg-background" : "bg-blue-light"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-medium text-text-primary">{n.title}</p>
                {n.content && <p className="mt-1 text-[13px] text-text-secondary">{n.content}</p>}
                <p className="mt-1 text-[13px] text-text-secondary">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <form action={markReadAction.bind(null, n.id)}>
                  <button type="submit" className="whitespace-nowrap text-[13px] text-blue hover:underline">
                    Mark read
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="rounded-card border border-border bg-surface px-4 py-8 text-center text-[15px] text-text-secondary">
            You're all caught up.
          </p>
        )}
      </div>
    </div>
  );
}
