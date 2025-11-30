/**
 * ConversationList Component
 * Lista de conversas do usuário
 * Com scroll, search, e seleção ativa
 * 
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import { ConversationWithDetails } from '@/types/conversations';
import { ConversationItem } from './conversation-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  // Filter conversations by name
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;

    return conversations.filter((conv) =>
      conv.contact?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  return (
    <div className="flex flex-col h-full">
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Conversas</h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* Conversations List */}
      {/* ============================================ */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground p-4">
          <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm text-center">
            {conversations.length === 0
              ? 'Nenhuma conversa ainda'
              : 'Nenhum resultado encontrado'}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filtered.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={selectedId === conversation.id}
                onClick={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
