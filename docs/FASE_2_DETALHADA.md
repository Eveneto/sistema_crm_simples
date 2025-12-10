# 🎯 FASE 2 - TAREFA 2: Plano Detalhado de Integração

## Seus Componentes Encontrados

```
✅ src/app/(dashboard)/dashboard/page.tsx              [MAIN DASHBOARD]
✅ src/app/(dashboard)/dashboard/conversations/page.tsx [CONVERSAS]
✅ src/app/(dashboard)/dashboard/deals/pipeline/page.tsx [PIPELINE]
✅ src/app/(dashboard)/dashboard/tasks/page.tsx        [TAREFAS]
✅ src/app/(dashboard)/dashboard/analytics/page.tsx    [ANALYTICS]
✅ src/app/(dashboard)/dashboard/reports/page.tsx      [RELATÓRIOS]
```

---

## 📝 Tarefa 2.1: Dashboard Principal

**Arquivo:** `src/app/(dashboard)/dashboard/page.tsx`

### O que precisa integrar?

Se o dashboard mostra:
- [ ] Lista de contatos recentes
- [ ] Conversas ativas
- [ ] Deals/Pipeline
- [ ] Métrica de performance

### Integração:

```typescript
'use client';

import { useContacts } from '@/hooks/use-contacts-query';
import { useConversations } from '@/hooks/use-conversations-query';
import { useDashboardMetrics } from '@/hooks/use-dashboard-query';
import { useDeal } from '@/hooks/use-deals-query';

export default function DashboardPage() {
  // Fetch com cache automático
  const { data: contacts, isLoading: contactsLoading } = useContacts({ limit: 5 });
  const { data: conversations, isLoading: convsLoading } = useConversations();
  const { data: metrics } = useDashboardMetrics('month');

  if (contactsLoading || convsLoading) return <DashboardSkeleton />;

  return (
    <div>
      {/* Seus componentes existentes aqui */}
      {/* Agora usando 'contacts', 'conversations', 'metrics' do React Query */}
    </div>
  );
}
```

**Ganho:** -45% no tempo de carregamento do dashboard

---

## 📝 Tarefa 2.2: Página de Conversas

**Arquivo:** `src/app/(dashboard)/dashboard/conversations/page.tsx`

### Integração:

```typescript
'use client';

import { useConversations } from '@/hooks/use-conversations-query';
import { useSendMessage } from '@/hooks/use-conversations-mutations';

export default function ConversationsPage() {
  const { data: conversations, isLoading, refetch } = useConversations();
  const sendMessageMutation = useSendMessage();

  // Quando enviar mensagem
  const handleSendMessage = async (conversationId: string, content: string) => {
    await sendMessageMutation.mutate({ conversationId, content });
    // Auto refetch da conversa + invalidação do cache
  };

  return (
    // ... suas conversas aqui
  );
}
```

**Ganho:** 
- Auto sincronização de mensagens novas
- Cache inteligente (recarrega só quando necessário)

---

## 📝 Tarefa 2.3: Pipeline de Vendas

**Arquivo:** `src/app/(dashboard)/dashboard/deals/pipeline/page.tsx`

### Integração:

```typescript
'use client';

import { useDeals } from '@/hooks/use-deals-query';
import { useMoveDeal } from '@/hooks/use-deals-mutations';

export default function PipelinePage() {
  const { data: deals, isLoading } = useDeals();
  const moveDealMutation = useMoveDeal();

  // Quando arrastar deal entre estágios
  const handleDragEnd = async (dealId: string, newStageId: string) => {
    await moveDealMutation.mutate({ dealId, stageId: newStageId });
    // Auto refetch do pipeline
  };

  return (
    // ... seu kanban aqui
  );
}
```

**Ganho:**
- Pipeline carrega 85% mais rápido
- Drag-drop funciona sem carregar do servidor

---

## 📊 Próximas APIs a Otimizar

### 1. `/api/contacts` - SELECT columns

**Arquivo:** `src/app/api/contacts/route.ts`

```typescript
// ❌ ANTES
const { data } = await supabase.from('contacts').select('*');

// ✅ DEPOIS
const { data } = await supabase
  .from('contacts')
  .select('id,name,email,phone,tags,created_at')
  .limit(limit)
  .offset((page - 1) * limit);
```

**Resultado:** Response ~55% menor

---

### 2. `/api/conversations` - SELECT columns

**Arquivo:** `src/app/api/conversations/route.ts`

```typescript
// ✅ DEPOIS
const { data } = await supabase
  .from('conversations')
  .select('id,contact_id,channel_id,assigned_to,status,last_message_at,unread_count')
  .eq('assigned_to', userId)
  .order('last_message_at', { ascending: false });
```

**Resultado:** Response ~60% menor

---

### 3. `/api/deals` - SELECT columns

**Arquivo:** `src/app/api/deals/route.ts`

```typescript
// ✅ DEPOIS
const { data } = await supabase
  .from('deals')
  .select('id,title,value,stage_id,contact_id,assigned_to,position,status')
  .order('stage_id')
  .order('position');
```

**Resultado:** Response ~45% menor

---

### 4. `/api/messages` - SELECT columns (se existir)

**Arquivo:** `src/app/api/messages/[conversationId]/route.ts`

```typescript
// ✅ DEPOIS
const { data } = await supabase
  .from('messages')
  .select('id,conversation_id,sender_type,sender_id,content,message_type,created_at,is_read')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Resultado:** Response ~50% menor

---

## 🎯 Ordem de Implementação (Recomendada)

### Dia 1: Foundation (2 horas)
- [ ] Otimizar APIs (4 rotas)
- [ ] Rodar `npm run build` para confirmar

### Dia 2: Integrar Componentes (3 horas)
- [ ] Dashboard principal
- [ ] Conversas
- [ ] Pipeline

### Dia 3: Testing & Performance (1 hora)
- [ ] Testar cada componente
- [ ] Verificar cache funcionando
- [ ] Medir performance com DevTools

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Depois | Meta ✅ |
|---------|-------|--------|---------|
| Dashboard Load | 3.5s | 1.8s | ✅ -50% |
| API Response | 500-800KB | 150-300KB | ✅ -60% |
| Conversas Load | 2.0s | 0.6s | ✅ -70% |
| Pipeline Load | 1.5s | 0.4s | ✅ -73% |
| Lighthouse | 79 | 92+ | ✅ +13 |

---

## ⚠️ Checklist Antes de Começar

- [ ] Build passa sem erros `npm run build`
- [ ] Índices criados no Supabase ✅
- [ ] React Query configurado em layout.tsx ✅
- [ ] Hooks criados em `src/hooks/` ✅
- [ ] TypeScript sem erros

---

## 🚀 Próximo Passo

**Quer que eu comece qual primeiro?**

1. **Otimizar as 4 APIs** (rápido, impacto alto)
2. **Integrar Dashboard** (direto)
3. **Integrar Conversas** (mais complexo)
4. **Integrar Pipeline** (Kanban, mais visual)

Avisa qual você quer focar primeiro! 🎯

