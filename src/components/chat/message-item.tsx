/**
 * MessageItem Component
 * Renders individual message
 * Aligns left or right based on sender
 *
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import type { Message } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  currentUserId?: string;
}

export function MessageItem({ message, isOwn, senderName }: MessageItemProps) {
  const timeLabel = formatDistanceToNow(new Date(message.created_at), {
    locale: ptBR,
    addSuffix: true,
  });

  return (
    <div className={cn('flex gap-2 mb-2', isOwn && 'justify-end')}>
      <div
        className={cn(
          'max-w-[70%] px-4 py-2 rounded-2xl space-y-1',
          'break-words whitespace-pre-wrap border shadow-sm',
          isOwn
            ? 'bg-primary/10 text-foreground border-primary/20 rounded-br-sm'
            : 'bg-background text-foreground border-border/60 rounded-bl-sm'
        )}
      >
        {!isOwn && senderName && <p className="text-xs font-semibold opacity-70">{senderName}</p>}

        <p className="text-sm leading-relaxed">{message.content}</p>

        <div className={cn('flex items-center', isOwn ? 'justify-end' : 'justify-start')}>
          <p className={cn('text-[11px]', isOwn ? 'text-foreground/60' : 'text-muted-foreground')}>
            {timeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
