import { Bell } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/DesignSystem";
import { getNotificationsAction, markAllReadAction, markReadAction } from "./actions";

export default async function NotificationsPage() {
  const { notifications } = await getNotificationsAction();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-2xl">
      <PageHeader
        title="Notifications"
        description="Stay updated with your learning and community activity."
        action={
          unreadCount > 0 ? (
            <div className="flex items-center gap-3">
              <Badge variant="blue">
                {unreadCount} unread
              </Badge>
              <form action={markAllReadAction}>
                <Button type="submit" size="sm">
                  Mark all read
                </Button>
              </form>
            </div>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            hover
            className={notification.read ? "bg-white" : "border-[#4451A2]/20 bg-[#EEF0FA]"}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  {!notification.read && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4451A2]" />}
                  <p className="text-base font-semibold text-[#1A1A2E]">{notification.title}</p>
                </div>
                {notification.content && <p className="mt-2 text-sm leading-6 text-[#666666]">{notification.content}</p>}
                <p className="mt-3 text-xs text-[#767782]">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <form action={markReadAction.bind(null, notification.id)} className="shrink-0">
                  <Button type="submit" size="sm" variant="secondary">
                    Mark read
                  </Button>
                </form>
              )}
            </div>
          </Card>
        ))}

        {notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New learning and community updates will appear here."
          />
        )}
      </div>
    </div>
  );
}
