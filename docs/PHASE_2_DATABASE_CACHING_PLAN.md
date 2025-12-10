# 🗄️ FASE 2: Database & Caching - Plano de Ação

**Objetivo:** Otimizar banco de dados e implementar cache inteligente  
**Estimado:** 6-8 horas  
**Impacto:** -70% latência API, -50% dados trafegados

---

## 📋 Tarefas

### TAREFA 1: Criar Índices no Banco (1 hora) ⏱️

**Status:** ⏳ Pronto para começar

**O que fazer:**
1. Conectar ao Supabase
2. Executar SQL para criar índices
3. Validar índices criados

**Índices necessários:**

```sql
-- 1. Para buscar contatos por nome (full-text search)
CREATE INDEX IF NOT EXISTS idx_contacts_name 
ON contacts USING GIN (name gin_trgm_ops);

-- 2. Índice para filtrar por usuário
CREATE INDEX IF NOT EXISTS idx_contacts_user_id 
ON contacts(user_id);

-- 3. Para conversas do usuário
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to 
ON conversations(assigned_to);

-- 4. Para conversas do contato
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id 
ON conversations(contact_id);

-- 5. Para mensagens da conversa
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- 6. Para ordenação de mensagens
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- 7. Para deals do usuário
CREATE INDEX IF NOT EXISTS idx_deals_user_id 
ON deals(user_id);

-- 8. Para pipeline
CREATE INDEX IF NOT EXISTS idx_deals_stage_id 
ON deals(stage_id);
```

**Tempo:** 10 minutos  
**Impacto:** -60% latência em queries

---

### TAREFA 2: Configurar React Query (2 horas) ⏱️

**Status:** ⏳ Pronto para começar

**O que fazer:**
1. Instalar `@tanstack/react-query` (já está instalado)
2. Criar `QueryClientProvider` wrapper
3. Adicionar em layout.tsx
4. Configurar stale times e gcTime

**Arquivo:** `src/lib/react-query.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter em memória por 30 minutos
      gcTime: 30 * 60 * 1000,
      // Refetch ao voltar para janela
      refetchOnWindowFocus: true,
      // Refetch ao reconectar
      refetchOnReconnect: true,
      // Retry 1x em erro
      retry: 1,
    },
  },
});
```

**Arquivo:** `src/app/layout.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Tempo:** 30 minutos (setup)

---

### TAREFA 3: Migrar Hooks para React Query (3 horas) ⏱️

**Status:** ⏳ Pronto para começar

**O que fazer:**
Converter dados de API para usar React Query:

#### 3.1 Contatos - `useContacts`

**Arquivo:** `src/hooks/use-contacts.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { Contact } from '@/types/contact';

export function useContacts(page = 1, search = '') {
  return useQuery({
    queryKey: ['contacts', page, search],
    queryFn: async () => {
      const response = await fetch(
        `/api/contacts?page=${page}&search=${search}`
      );
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json() as Promise<{ contacts: Contact[] }>;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
```

**Uso:**
```typescript
const { data, isLoading } = useContacts(page, search);
```

**Tempo:** 30 minutos

#### 3.2 Conversas - `useConversations`

**Arquivo:** `src/hooks/use-conversations.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 min (conversas mudam rápido)
  });
}
```

**Tempo:** 20 minutos

#### 3.3 Messages - `useMessages`

**Arquivo:** `src/hooks/use-messages.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 min
  });
}
```

**Tempo:** 20 minutos

#### 3.4 Deals/Pipeline - `useDeals`

**Arquivo:** `src/hooks/use-deals.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
```

**Tempo:** 20 minutos

#### 3.5 Dashboard - `useDashboardMetrics`

**Arquivo:** `src/hooks/use-dashboard-metrics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useDashboardMetrics(period: string) {
  return useQuery({
    queryKey: ['metrics', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 min (métricas mudam menos)
  });
}
```

**Tempo:** 20 minutos

**Total Tarefa 3:** ~2 horas

---

### TAREFA 4: Otimizar Queries no Backend (1.5 horas) ⏱️

**Status:** ⏳ Pronto para começar

**O que fazer:**
Reduzir tamanho das respostas selecionando colunas específicas

#### 4.1 GET /api/contacts

**Arquivo:** `src/app/api/contacts/route.ts`

**Antes:**
```typescript
const { data } = await supabase.from('contacts').select('*');
```

**Depois:**
```typescript
const { data } = await supabase
  .from('contacts')
  .select('id, name, email, phone, tags, created_at')
  .range(offset, offset + 49) // Paginação
  .order('created_at', { ascending: false });
```

**Impacto:** -40% tamanho response

**Tempo:** 15 minutos

#### 4.2 GET /api/conversations

**Arquivo:** `src/app/api/conversations/route.ts`

**Antes:**
```typescript
const { data } = await supabase.from('conversations').select('*');
```

**Depois:**
```typescript
const { data } = await supabase
  .from('conversations')
  .select('id, contact_id, channel_id, assigned_to, status, last_message_at')
  .or(`assigned_to.eq.${userId},assigned_to.is.null`)
  .order('last_message_at', { ascending: false });
```

**Impacto:** -50% tamanho response

**Tempo:** 15 minutos

#### 4.3 GET /api/deals

**Arquivo:** `src/app/api/deals/route.ts`

```typescript
const { data } = await supabase
  .from('deals')
  .select('id, name, value, stage_id, contact_id, user_id, probability, created_at')
  .eq('user_id', userId)
  .neq('status', 'archived');
```

**Impacto:** -45% tamanho response

**Tempo:** 15 minutos

**Total Tarefa 4:** ~45 minutos

---

### TAREFA 5: Adicionar Mutations (1.5 horas) ⏱️

**Status:** ⏳ Pronto para começar

**O que fazer:**
Adicionar React Query mutations para criar/editar/deletar

#### 5.1 useCreateContact

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create contact');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate contacts cache
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
```

**Tempo:** 30 minutos para todos mutations (create/update/delete)

---

## ✅ Checklist de Execução

### Fase 2A: Database (30 min)
- [ ] Conectar a Supabase
- [ ] Executar SQL para índices
- [ ] Validar índices criados
- [ ] Teste de performance

### Fase 2B: React Query Setup (30 min)
- [ ] Instalar/verificar @tanstack/react-query
- [ ] Criar QueryClient
- [ ] Adicionar QueryClientProvider no layout
- [ ] Verificar funcionamento

### Fase 2C: Migrar Hooks (2 horas)
- [ ] useContacts
- [ ] useConversations
- [ ] useMessages
- [ ] useDeals
- [ ] useDashboardMetrics

### Fase 2D: Otimizar Queries (45 min)
- [ ] GET /api/contacts
- [ ] GET /api/conversations
- [ ] GET /api/deals
- [ ] GET /api/dashboard/metrics

### Fase 2E: Mutations (30 min)
- [ ] useCreateContact
- [ ] useUpdateContact
- [ ] useDeleteContact
- [ ] Outros mutations

---

## 📊 Impacto Esperado

**ANTES:**
```
Database Response:  200-500ms
Network Size:       ~150KB por request
Cache:              Nenhum
API Calls:          1 por render
```

**DEPOIS:**
```
Database Response:  50-100ms (-75%)
Network Size:       ~75KB por request (-50%)
Cache:              Inteligente (5-30 min)
API Calls:          1 por 5-30 min (-95%)
```

---

## 🎯 KPIs

| Métrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| API Latency | 250ms | 75ms | -70% ✅ |
| Network Payload | 150KB | 75KB | -50% ✅ |
| Time to Paint | 2.1s | 1.5s | -29% ✅ |
| Cache Hits | 0% | 85% | +85% ✅ |

---

## 🚀 Próximos Passos

1. ✅ Executar SQL indices
2. ✅ Setup React Query
3. ✅ Migrar componentes para usar hooks
4. ✅ Otimizar queries
5. ✅ Adicionar mutations
6. ✅ Build & test

**Estimated Total:** 6-8 horas  
**Ready to start?** 🚀
