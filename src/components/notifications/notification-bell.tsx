// ============================================
// Component: NotificationBell
// Sprint 3 - US-027
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { NotificationList } from './notification-list';
import { logger } from '@/lib/logger';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Buscar contagem de não lidas
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      logger.error('Failed to fetch unread count', { error });
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Polling a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Atualizar contagem quando o popover abre
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchUnreadCount();
    }
  };

  // Callback quando notificações são marcadas como lidas
  const handleNotificationsRead = () => {
    setUnreadCount(0);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList onNotificationsRead={handleNotificationsRead} />
      </PopoverContent>
    </Popover>
  );
}
