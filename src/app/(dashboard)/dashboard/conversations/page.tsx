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
import type { ConversationWithDetails } from '@/types/conversations';
import type { Contact } from '@/types/contact';
import type { Message } from '@/types/database';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Load conversations and contacts on mount
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Load conversations
        const conversationsResponse = await fetch('/api/conversations');
        if (!conversationsResponse.ok) {
          throw new Error('Erro ao buscar conversas');
        }
        const conversationsData = await conversationsResponse.json();
        setConversations(conversationsData);

        // Load contacts
        const contactsResponse = await fetch('/api/contacts');
        if (!contactsResponse.ok) {
          throw new Error('Erro ao buscar contatos');
        }
        const contactsData = await contactsResponse.json();
        // API retorna { data: [...], pagination: {...} }
        setContacts(contactsData.data || []);

        // Auto-select first conversation
        if (conversationsData.length > 0 && !selectedId) {
          setSelectedId(conversationsData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        const message = error instanceof Error ? error.message : 'Erro ao buscar dados';
        setError(message);
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedId]);

  // ============================================
  // Load messages when conversation is selected
  // ============================================
  useEffect(() => {
    if (!selectedId) return;

    const loadMessages = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/conversations/${selectedId}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar mensagens');
        }

        const data = await response.json();
        setMessages(data.messages || []);

        // Mark as read
        await fetch(`/api/conversations/${selectedId}/read`, {
          method: 'PATCH'
        });

        // Update unread_count
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, unread_count: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error loading messages:', error);
        const message = error instanceof Error ? error.message : 'Erro ao buscar mensagens';
        setError(message);
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive'
        });
      }
    };

    loadMessages();
  }, [selectedId]);

  // ============================================
  // Send message handler
  // ============================================
  const handleSendMessage = async (message: Message) => {
    // MessageInput já enviou a mensagem para API
    // Apenas adicionar ao estado local
    setMessages((prev) => [...prev, message]);

    // Update last_message_at in conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, last_message_at: new Date().toISOString() }
          : c
      )
    );

    toast({
      description: 'Mensagem enviada'
    });
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentUserId = ''; // TODO: Get from auth context

  const handleConversationCreated = (conversationId: string) => {
    // Reload conversations
    const loadConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          setSelectedId(conversationId);
        }
      } catch (error) {
        console.error('Error reloading conversations:', error);
      }
    };
    loadConversations();
  };

  return (
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
              loading={sendingMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground space-y-2">
                {loading ? (
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
  );
}
