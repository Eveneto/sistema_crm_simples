// ============================================
// Component: NotificationItem
// Sprint 3 - US-027
// ============================================

'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
} from '@/types/notification';
import type { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = async () => {
    // Marcar como lida se ainda não está
    if (!notification.read) {
      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_ids: [notification.id] }),
        });

        if (response.ok) {
          onRead(notification.id);
        }
      } catch (error) {
        logger.error('Failed to mark notification as read', {
          error,
          notificationId: notification.id,
        });
      }
    }

    // Navegar para o link se existir
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.created_at);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left p-4 hover:bg-accent transition-colors',
        !notification.read && 'bg-blue-50 dark:bg-blue-950/20'
      )}
    >
      <div className="flex gap-3">
        {/* Ícone */}
        <div className={cn('flex-shrink-0 text-2xl', color)}>{icon}</div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={cn('text-sm font-medium', !notification.read && 'font-semibold')}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>

          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
}
