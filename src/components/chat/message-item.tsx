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

export function MessageItem({
  message,
  isOwn,
  senderName
}: MessageItemProps) {
  const timeLabel = formatDistanceToNow(new Date(message.created_at), {
    locale: ptBR,
    addSuffix: true
  });

  return (
    <div className={cn(
      'flex gap-2 mb-2',
      isOwn && 'justify-end'
    )}>
      <div className={cn(
        'max-w-xs px-4 py-2 rounded-lg space-y-1',
        'break-words whitespace-pre-wrap',
        isOwn
          ? 'bg-primary text-primary-foreground rounded-br-none'
          : 'bg-muted text-foreground rounded-bl-none'
      )}>
        {!isOwn && senderName && (
          <p className="text-xs font-semibold opacity-70">
            {senderName}
          </p>
        )}
        
        <p className="text-sm leading-relaxed">
          {message.content}
        </p>
        
        <p className={cn(
          'text-xs',
          isOwn
            ? 'text-primary-foreground/70'
            : 'text-muted-foreground'
        )}>
          {timeLabel}
        </p>
      </div>
    </div>
  );
}
