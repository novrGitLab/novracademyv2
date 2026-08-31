"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/DesignSystem";
import { getNotificationsAction, markAllReadAction, markReadAction } from "./actions";
import type { Notification } from "./actions";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { notifications } = await getNotificationsAction();
    setNotifications(notifications);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllReadAction();
    await load();
  }, [load]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markReadAction(id);
      await load();
    },
    [load]
  );

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
              <Button size="sm" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            </div>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-card border border-border bg-background p-5 shadow-card">
              <div className="h-4 w-52 animate-pulse rounded bg-[#E8E9F1]" />
              <div className="mt-2 h-3 w-80 max-w-full animate-pulse rounded bg-[#E8E9F1]" />
            </div>
          ))}
        </div>
      ) : (
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
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {notifications.length === 0 && (
            <EmptyState
              icon={<Bell aria-hidden="true" className="h-6 w-6" />}
              title="You're all caught up"
              description="New learning and community updates will appear here."
            />
          )}
        </div>
      )}
    </div>
  );
}
