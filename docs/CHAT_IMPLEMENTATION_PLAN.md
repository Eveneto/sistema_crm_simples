# 🚀 CHAT IMPLEMENTATION - ACTION PLAN

**Status:** 🟢 Database pronto, falta API + UI  
**Timeline:** 3-4 dias (máximo)  
**Complexidade:** FÁCIL (reutilizar padrões Sprint 4)

---

## ✅ O QUE JÁ EXISTE

### Database ✅
```
✅ conversations table (existente)
   └─ id, contact_id, channel_id, assigned_to, status, unread_count, created_at, updated_at

✅ messages table (existente)
   └─ id, conversation_id, sender_type, sender_id, content, media_url, message_type, is_read, created_at

✅ RLS policies (existentes)
   └─ authenticated_view_conversations
   └─ authenticated_insert_conversations
   └─ authenticated_view_messages
   └─ authenticated_insert_messages

✅ Indexes (existentes)
   └─ idx_conversations_contact
   └─ idx_messages_conversation
```

### Types ✅
```
✅ conversations.ts (tipos prontos)
   └─ ConversationWithDetails
   └─ CreateMessageInput
   └─ ConversationFilters
```

### UI Components ❌
```
❌ Não existem components de chat

Falta:
- conversation-list.tsx
- conversation-item.tsx
- chat-window.tsx
- message-list.tsx
- message-item.tsx
- message-input.tsx
```

### API Endpoints ❌
```
❌ Não existem endpoints de chat

Falta:
- GET /api/conversations
- GET /api/conversations/[id]
- POST /api/messages
- PATCH /api/conversations/[id]/read
```

### Pages ❌
```
❌ Não existem páginas de chat

Falta:
- /dashboard/conversas/page.tsx
- /dashboard/conversas/[id]/page.tsx
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### STEP 1: API Endpoints (1-2h)

**1.1 GET /api/conversations**
```typescript
// src/app/api/conversations/route.ts

import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    
    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        unread_count,
        last_message_at,
        created_at,
        contact:contacts(id, name, avatar_url, phone),
        messages(id, content, created_at) order by created_at desc limit 1
      `)
      .eq('assigned_to', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**1.2 POST /api/messages**
```typescript
// src/app/api/messages/route.ts

import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createMessageSchema } from '@/lib/validations/message';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = createMessageSchema.parse(body);

    const supabase = await createClient();

    // Verificar que a conversa pertence ao usuário
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', validated.conversation_id)
      .eq('assigned_to', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Inserir mensagem
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: validated.conversation_id,
        sender_type: 'user',
        sender_id: user.id,
        content: validated.content,
        message_type: 'text'
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Atualizar last_message_at na conversa
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', validated.conversation_id);

    return NextResponse.json(message);
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**1.3 GET /api/conversations/[id]**
```typescript
// src/app/api/conversations/[id]/route.ts

import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', params.id)
      .eq('assigned_to', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Buscar mensagens (paginado - últimas 50)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (msgError) throw msgError;

    return NextResponse.json({
      ...conversation,
      messages
    });
  } catch (error) {
    console.error('GET /api/conversations/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**1.4 PATCH /api/conversations/[id]/read**
```typescript
// src/app/api/conversations/[id]/read/route.ts

import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();

    // Marcar mensagens como lidas
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', params.id)
      .neq('sender_id', user.id);

    if (updateError) throw updateError;

    // Resetar unread_count na conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', params.id)
      .eq('assigned_to', user.id)
      .select()
      .single();

    if (convError) throw convError;

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('PATCH /api/conversations/[id]/read error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

### STEP 2: Validations (30min)

**2.1 Create message schema**
```typescript
// src/lib/validations/message.ts

import { z } from 'zod';

export const createMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string()
    .min(1, 'Mensagem não pode ser vazia')
    .max(5000, 'Mensagem muito longa')
    .trim()
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
```

---

### STEP 3: Components (2-3h)

**3.1 message-input.tsx (Simples)**
```typescript
// src/components/chat/message-input.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useState } from 'react';

interface MessageInputProps {
  conversationId: string;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ conversationId, onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await onSend(content);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Digite uma mensagem..."
        disabled={disabled || loading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || loading || !content.trim()}
        size="sm"
      >
        {loading ? (
          <div className="animate-spin">...</div>
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
```

**3.2 message-item.tsx (Simples)**
```typescript
// src/components/chat/message-item.tsx

import { Message } from '@/types/conversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
}

export function MessageItem({ message, isOwn, senderName }: MessageItemProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-semibold mb-1 opacity-70">{senderName}</p>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
          {formatDistanceToNow(new Date(message.created_at), {
            locale: ptBR,
            addSuffix: true
          })}
        </p>
      </div>
    </div>
  );
}
```

**3.3 message-list.tsx (Simples)**
```typescript
// src/components/chat/message-list.tsx

import { Message } from '@/types/conversations';
import { MessageItem } from './message-item';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  contactName: string;
}

export function MessageList({ messages, currentUserId, contactName }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
          senderName={message.sender_id !== currentUserId ? contactName : undefined}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
```

**3.4 conversation-item.tsx**
```typescript
// src/components/chat/conversation-item.tsx

import { ConversationWithDetails } from '@/types/conversations';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={conversation.contact?.avatar_url} />
          <AvatarFallback>{conversation.contact?.name?.[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm truncate">
              {conversation.contact?.name}
            </h3>
            {conversation.unread_count > 0 && (
              <Badge variant="default" className="ml-2">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-600 truncate">
            {conversation.last_message?.content || 'Sem mensagens'}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {conversation.last_message_at
              ? formatDistanceToNow(new Date(conversation.last_message_at), {
                  locale: ptBR,
                  addSuffix: true
                })
              : 'Recente'}
          </p>
        </div>
      </div>
    </button>
  );
}
```

**3.5 conversation-list.tsx**
```typescript
// src/components/chat/conversation-list.tsx

import { ConversationWithDetails } from '@/types/conversations';
import { ConversationItem } from './conversation-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';

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
  return (
    <ScrollArea className="h-full border-r">
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="animate-spin w-5 h-5 text-gray-400" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>Nenhuma conversa</p>
        </div>
      ) : (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={selectedId === conversation.id}
            onClick={() => onSelect(conversation.id)}
          />
        ))
      )}
    </ScrollArea>
  );
}
```

**3.6 chat-window.tsx**
```typescript
// src/components/chat/chat-window.tsx

import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Message, ConversationWithDetails } from '@/types/conversations';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback>{conversation.contact?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{conversation.contact?.name}</h2>
            <p className="text-xs text-gray-600">{conversation.contact?.phone}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      {messages.length > 0 ? (
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          contactName={conversation.contact?.name || 'Contato'}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Inicie uma conversa</p>
        </div>
      )}

      {/* Input */}
      <MessageInput
        conversationId={conversation.id}
        onSend={onSendMessage}
        disabled={loading}
      />
    </div>
  );
}
```

---

### STEP 4: Pages (1h)

**4.1 /dashboard/conversas/page.tsx**
```typescript
// src/app/(dashboard)/dashboard/conversas/page.tsx

'use client';

import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { Message, ConversationWithDetails } from '@/types/conversations';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConversasPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Buscar conversas ao carregar
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (!res.ok) throw new Error('Failed to load conversations');
        const data = await res.json();
        setConversations(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Buscar mensagens quando conversa é selecionada
  useEffect(() => {
    if (!selectedId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedId}`);
        if (!res.ok) throw new Error('Failed to load messages');
        const data = await res.json();
        setMessages(data.messages || []);

        // Marcar como lido
        await fetch(`/api/conversations/${selectedId}/read`, {
          method: 'PATCH'
        });

        // Atualizar badge
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedId ? { ...c, unread_count: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedId]);

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedId,
          content
        })
      });

      if (!res.ok) throw new Error('Failed to send message');
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="col-span-1 border rounded-lg overflow-hidden bg-white">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
        />
      </div>

      {/* Chat */}
      {selectedConversation ? (
        <div className="col-span-3 border rounded-lg overflow-hidden bg-white">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            currentUserId={''} // Pega do contexto real
            onSendMessage={handleSendMessage}
            loading={sendingMessage}
          />
        </div>
      ) : (
        <div className="col-span-3 border rounded-lg flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Selecione uma conversa para começar</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 ESTIMATIVA DE TEMPO

```
STEP 1: API Endpoints      → 1-2h
STEP 2: Validations        → 30min
STEP 3: Components         → 2-3h
STEP 4: Pages              → 1h
STEP 5: Tests              → 1-2h
STEP 6: Polish + Deploy    → 1h

TOTAL: 8-10h
```

---

## 🎯 PRÓXIMAS AÇÕES

### AGORA (30/11):
```
[ ] Ler este plano
[ ] Confirmar implementação
[ ] Criar branch sprint-5/chat
```

### AMANHÃ (01/12):
```
[ ] Implementar API endpoints
[ ] Implementar validações
[ ] Começar components
```

### SEGUNDA-TERÇA (06-07/12):
```
[ ] Finalizar components
[ ] Implementar pages
[ ] Testes
```

### QUARTA (08/12):
```
[ ] Deploy staging
[ ] Testing em produção
[ ] Bug fixes
```

---

**Status:** 🟢 Pronto para começar!  
**Complexidade:** ⭐⭐ Fácil (padrões da Sprint 4)  
**Confiança:** ✅ 95%+ sucesso

---
