/**
 * ConversationItem Component
 * Item individual na lista de conversas
 * Mostra contato, última mensagem, badge de não-lido
 *
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import { ConversationWithDetails } from '@/types/conversations';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const lastMessageTime = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), {
        locale: ptBR,
        addSuffix: true,
      })
    : 'Agora';

  const lastMessagePreview = conversation.last_message?.content
    ? conversation.last_message.content.substring(0, 50) +
      (conversation.last_message.content.length > 50 ? '...' : '')
    : 'Sem mensagens';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-md transition-colors',
        'hover:bg-muted/40',
        isActive && 'bg-muted/60 ring-1 ring-border'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={conversation.contact?.avatar_url || undefined}
            alt={conversation.contact?.name}
          />
          <AvatarFallback>{conversation.contact?.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Name + Badge */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm truncate">
              {conversation.contact?.name || 'Contato desconhecido'}
            </h3>
            {conversation.unread_count > 0 && (
              <Badge
                variant="default"
                className="flex-shrink-0 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Badge>
            )}
          </div>

          {/* Last message preview */}
          <p className={cn('text-xs truncate', isActive ? 'opacity-80' : 'text-muted-foreground')}>
            {lastMessagePreview}
          </p>

          {/* Time */}
          <p className={cn('text-xs', isActive ? 'opacity-70' : 'text-muted-foreground/70')}>
            {lastMessageTime}
          </p>
        </div>
      </div>
    </button>
  );
}
