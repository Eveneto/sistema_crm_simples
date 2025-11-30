/**
 * ChatWindow Component
 * Main chat interface
 * Composed of: Header + MessageList + MessageInput
 * 
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import { ConversationWithDetails } from '@/types/conversations';
import type { Message } from '@/types/database';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Phone, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: ConversationWithDetails;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onClose?: () => void;
  loading?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onClose,
  loading
}: ChatWindowProps) {
  const handleSendMessage = async (content: string) => {
    await onSendMessage(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b',
        'bg-card'
      )}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={conversation.contact?.avatar_url || undefined}
              alt={conversation.contact?.name}
            />
            <AvatarFallback>
              {conversation.contact?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="font-semibold text-sm leading-tight">
              {conversation.contact?.name || 'Contato'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.contact?.phone || conversation.contact?.email || 'Sem contato'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Ligar"
            className="h-8 w-8 p-0"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Mais opções"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fechar"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* Messages Container */}
      {/* ============================================ */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        contactName={conversation.contact?.name || 'Contato'}
        loading={loading}
      />

      {/* ============================================ */}
      {/* Message Input */}
      {/* ============================================ */}
      <MessageInput
        conversationId={conversation.id}
        onMessageSent={handleSendMessage}
        disabled={loading}
      />
    </div>
  );
}
