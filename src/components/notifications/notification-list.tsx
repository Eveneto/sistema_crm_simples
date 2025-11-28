// ============================================
// Component: NotificationList
// Sprint 3 - US-027
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { NotificationItem } from './notification-item';
import type { Notification } from '@/types/notification';

interface NotificationListProps {
  onNotificationsRead?: () => void;
}

export function NotificationList({ onNotificationsRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      logger.error('Failed to fetch notifications', { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
      });

      if (response.ok) {
        // Atualizar estado local
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() }))
        );
        onNotificationsRead?.();
      }
    } catch (error) {
      logger.error('Failed to mark all as read', { error });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
    );
    onNotificationsRead?.();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notificações</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </>
            )}
          </Button>
        )}
      </div>

      {/* Lista */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleNotificationRead}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
