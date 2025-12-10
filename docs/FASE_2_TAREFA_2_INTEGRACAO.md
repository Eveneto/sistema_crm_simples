# 🚀 FASE 2 - TAREFA 2: Integração React Query
## Status: PRONTO PARA IMPLEMENTAR

---

## 📋 O Que Já Existe

✅ React Query configurado em `src/lib/react-query.ts`
✅ 8 custom hooks criados em `src/hooks/`
✅ Layout com QueryClientProvider em `src/app/layout.tsx`
✅ Documentação completa

**Próximo:** Integrar em COMPONENTES reais

---

## 🎯 Plano de Integração (4-5 horas)

### TAREFA 2.1: Integrar em ContactsList (1 hora)

**Arquivo:** `src/app/(dashboard)/contacts/page.tsx` ou componente de lista

**Mudanças:**
```typescript
// ❌ ANTES
const [contacts, setContacts] = useState([]);
useEffect(() => {
  fetch('/api/contacts')
    .then(r => r.json())
    .then(setContacts);
}, []);

// ✅ DEPOIS
import { useContacts } from '@/hooks/use-contacts-query';

const { data, isLoading, error } = useContacts({ page: 1, search: '' });
```

**Benefício:**
- Auto caching de 5 minutos
- Auto refetch on focus
- Auto retry em erro

---

### TAREFA 2.2: Integrar em ConversationsList (1 hora)

**Arquivo:** `src/app/(dashboard)/conversas/page.tsx` ou similar

**Mudanças:**
```typescript
import { useConversations } from '@/hooks/use-conversations-query';

const { data: conversations, isLoading } = useConversations();
```

**Benefício:**
- Conversas sempre frescas quando volta pra aba
- Sincronização automática com mensagens

---

### TAREFA 2.3: Integrar em DealsList/Pipeline (1 hora)

**Arquivo:** `src/app/(dashboard)/pipeline/page.tsx` ou `deals/page.tsx`

**Mudanças:**
```typescript
import { useDeals } from '@/hooks/use-deals-query';

const { data: deals, isLoading } = useDeals();
```

**Benefício:**
- Carregamento super rápido (cache)
- Drag-drop funciona melhor

---

### TAREFA 2.4: Otimizar APIs (1.5 horas)

**Objetivo:** Reduzir tamanho das respostas selecionando apenas colunas necessárias

#### 2.4.1: `/api/contacts`

**Arquivo:** `src/app/api/contacts/route.ts`

**Mudança:**
```typescript
// ❌ ANTES
const { data } = await supabase
  .from('contacts')
  .select('*')
  .limit(50);

// ✅ DEPOIS
const { data } = await supabase
  .from('contacts')
  .select('id,name,email,phone,tags,created_at')
  .limit(50);
```

**Benefício:** -50% response size

---

#### 2.4.2: `/api/conversations`

**Arquivo:** `src/app/api/conversations/route.ts`

**Mudança:**
```typescript
// ✅ Select apenas essas colunas
.select('id,contact_id,channel_id,assigned_to,status,last_message_at,unread_count')
```

**Benefício:** -60% response size

---

#### 2.4.3: `/api/deals`

**Arquivo:** `src/app/api/deals/route.ts`

**Mudança:**
```typescript
// ✅ Select apenas essas colunas
.select('id,title,value,stage_id,contact_id,assigned_to,position,status')
```

**Benefício:** -40% response size

---

#### 2.4.4: `/api/messages`

**Arquivo:** `src/app/api/messages/[conversationId]/route.ts`

**Mudança:**
```typescript
// ✅ Select apenas essas colunas
.select('id,conversation_id,sender_type,sender_id,content,message_type,created_at,is_read')
```

**Benefício:** -55% response size

---

### TAREFA 2.5: Testar Mutations (30 min)

**Integrar em componentes de CRIAR/EDITAR/DELETAR:**

```typescript
import { useCreateContact, useUpdateContact } from '@/hooks/use-contacts-mutations';

// Ao criar contato
const createMutation = useCreateContact();
await createMutation.mutate({ name, email, phone });
// → Auto invalida cache e recarrega lista

// Ao atualizar
const updateMutation = useUpdateContact();
await updateMutation.mutate({ id, ...changes });
// → Auto revalida cache
```

---

## 📊 Cronograma

| Tarefa | Tempo | Status |
|--------|-------|--------|
| 2.1: ContactsList | 1h | 🔴 TO DO |
| 2.2: ConversationsList | 1h | 🔴 TO DO |
| 2.3: Pipeline | 1h | 🔴 TO DO |
| 2.4: Otimizar APIs | 1.5h | 🔴 TO DO |
| 2.5: Testar Mutations | 30min | 🔴 TO DO |
| **TOTAL** | **5h** | **🔴 TO DO** |

---

## 🎯 Antes de Começar

Verifique:
- [ ] Índices foram criados (você já fez ✅)
- [ ] React Query está no layout ✅
- [ ] Hooks estão em `src/hooks/` ✅
- [ ] Build passa sem erros

```bash
npm run build
```

---

## ✨ Resultado Final

### Performance Esperada
- **Bundle:** -10% (remover lógica de cache manual)
- **API calls:** -70% (cache 5-30 min)
- **Page load:** -45% (índices + cache)
- **User interactions:** -80% (refetch automático)

### Lighthouse Score
- **Antes:** 79
- **Depois:** ~92-95

---

## 🚀 Como Proceder

Quer que eu:
1. ✅ **Comece a integrar** ContactsList agora?
2. ⏳ Crie um plano mais detalhado para cada tarefa?
3. 📊 Mostre exemplos de código para cada integração?

Qual prefere? 🎯

