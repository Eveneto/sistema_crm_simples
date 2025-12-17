/**
 * Dashboard - Conversations Page
 * Chat interface - Lista conversas e mostra o chat selecionado
 *
 * Layout:
 * - Header com título
 * - Grid 4 cols: 1 sidebar (conversas) + 3 chat window
 * - Integrado com componentes shadcn/ui
 */

'use client';

import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { CreateConversationDialog } from '@/components/chat/create-conversation-dialog';
import { Card } from '@/components/ui/card';
import { MessageCircle, AlertCircle } from 'lucide-react';
import type { Message } from '@/types/database';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConversations } from '@/hooks/use-conversations-query';
import { useContacts } from '@/hooks/use-contacts-query';
import { PageTransition } from '@/components/animations/page-transition';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // React Query hooks com cache automático
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();
  const {
    data: contactsData,
    isLoading: contactsLoading,
    error: contactsError,
  } = useContacts({ limit: 1000 });
  const contacts = contactsData?.contacts || [];

  // Auto-select first conversation quando conversas carregam
  if (conversations.length > 0 && !selectedId) {
    setSelectedId(conversations[0].id);
  }

  // Load messages when conversation is selected
  const loadMessages = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`/api/conversations/${selectedId}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      const data = await response.json();
      setMessages(data.messages || []);

      // Mark as read
      await fetch(`/api/conversations/${selectedId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading messages:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar mensagens';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Load messages quando conversa é selecionada
  if (selectedId && messages.length === 0) {
    loadMessages();
  }

  // ============================================
  // Send message handler
  // ============================================
  const handleSendMessage = async (message: Message) => {
    // MessageInput já enviou a mensagem para API
    // Apenas adicionar ao estado local
    setMessages((prev) => [...prev, message]);

    toast({
      description: 'Mensagem enviada',
    });
  };

  const loading = conversationsLoading || contactsLoading;
  const error = conversationsError
    ? (conversationsError as Error).message
    : (contactsError as Error)?.message;
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentUserId = ''; // TODO: Get from auth context

  const handleConversationCreated = (conversationId: string) => {
    // React Query invalidates automatically
    // Just select the new conversation
    setSelectedId(conversationId);
  };

  return (
    <PageTransition>
      <ErrorBoundary sectionName="Conversas">
        <div className="flex flex-col gap-6 h-full">
          {/* ============================================ */}
          {/* Header */}
          {/* ============================================ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
                <p className="text-muted-foreground">Comunique-se com seus contatos</p>
              </div>
            </div>
            <CreateConversationDialog
              contacts={contacts}
              onConversationCreated={handleConversationCreated}
            />
          </div>

          {/* ============================================ */}
          {/* Error Alert */}
          {/* ============================================ */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ============================================ */}
          {/* Chat Layout */}
          {/* ============================================ */}
          <div className="grid grid-cols-4 gap-4 flex-1">
            {/* Sidebar - Conversations List */}
            <Card className="col-span-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                loading={loading}
              />
            </Card>

            {/* Main - Chat Window */}
            <Card className="col-span-3 overflow-hidden">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  loading={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground space-y-2">
                    {conversationsLoading ? (
                      <>
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                        <p>Carregando conversas...</p>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-12 w-12 mx-auto opacity-20" />
                        <p>Selecione uma conversa para começar</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
