/**
 * MessageList Component
 * Message list renderer with auto-scroll
 * Auto-scrolls to bottom on new messages
 * 
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import type { Message } from '@/types/database';
import { MessageItem } from './message-item';
import { useEffect, useRef } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  contactName: string;
  loading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  contactName,
  loading
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn(
      'flex-1 overflow-y-auto p-4 space-y-3',
      'bg-muted/10'
    )}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Nenhuma mensagem ainda</p>
          <p className="text-xs opacity-70">Inicie a conversa!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            senderName={
              message.sender_id !== currentUserId ? contactName : undefined
            }
          />
        ))
      )}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Auto-scroll ref */}
      <div ref={endRef} />
    </div>
  );
}
