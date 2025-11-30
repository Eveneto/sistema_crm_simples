/**
 * Dashboard - Conversas Page
 * Lista todas as conversas e mostra o chat selecionado
 * Layout: Sidebar (conversas) + Main (chat window)
 */

'use client';

import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import type { ConversationWithDetails } from '@/types/conversations';
import type { Message } from '@/types/database';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ConversasPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Buscar conversas ao carregar página
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/conversations');

        if (!response.ok) {
          throw new Error('Erro ao buscar conversas');
        }

        const data = await response.json();
        setConversations(data);

        // Selecionar primeira conversa automaticamente
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao buscar conversas',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [selectedId]);

  // Buscar mensagens quando conversa é selecionada
  useEffect(() => {
    if (!selectedId) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${selectedId}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar mensagens');
        }

        const data = await response.json();
        setMessages(data.messages || []);

        // Marcar como lido
        await fetch(`/api/conversations/${selectedId}/read`, {
          method: 'PATCH'
        });

        // Atualizar unread_count na lista
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, unread_count: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao buscar mensagens',
          variant: 'destructive'
        });
      }
    };

    loadMessages();
  }, [selectedId]);

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    setSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedId,
          content
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);

      // Atualizar last_message_at na conversa
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Erro ao enviar mensagem',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedId
  );

  // Obter user ID do contexto (TODO: implementar contexto de auth)
  const currentUserId = ''; // Will be filled from context

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-100px)] p-4">
      {/* Sidebar - Lista de conversas */}
      <div className="col-span-1 rounded-lg overflow-hidden border bg-white shadow-sm">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
        />
      </div>

      {/* Main - Chat window */}
      {selectedConversation ? (
        <div className="col-span-3 rounded-lg overflow-hidden border bg-white shadow-sm">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            loading={sendingMessage}
          />
        </div>
      ) : (
        <div className="col-span-3 rounded-lg border bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            {loading ? (
              <p>Carregando conversas...</p>
            ) : (
              <p>Selecione uma conversa para começar</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
