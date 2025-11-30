# ✅ Sprint 5 Pre-Start Checklist

**Data:** 30/11/2025  
**Status:** Verificação antes de iniciar implementação

---

## 🔍 Verificações Necessárias

### 1️⃣ Database Schema

- [ ] Tabela `conversations` existe?
  ```sql
  SELECT * FROM information_schema.tables WHERE table_name='conversations';
  ```

- [ ] Tabela `messages` existe?
  ```sql
  SELECT * FROM information_schema.tables WHERE table_name='messages';
  ```

- [ ] RLS habilitado em ambas as tables?

- [ ] Foreign keys configuradas?

---

### 2️⃣ Autenticação

- [ ] `getUser()` funciona em Server Components?
  - Verificar em `/dashboard/deals/pipeline` (Sprint 4)

- [ ] Middleware de auth funciona?
  - Check: usuário sem login redireciona para `/login`

- [ ] `user_id` está disponível nas queries?

---

### 3️⃣ Estrutura de Pastas

**Criar esses diretórios antes de começar:**

```
src/app/(dashboard)/dashboard/conversas/
  └── [id]/

src/components/chat/
```

---

### 4️⃣ Tipos TypeScript Base

**Criar arquivo:**
```bash
touch src/types/message.ts
```

**Conteúdo mínimo:**
```typescript
export interface Conversation {
  id: string;
  contact_id: string;
  user_id: string;
  last_message?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ConversationWithContact extends Conversation {
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}
```

---

### 5️⃣ Validações Zod

**Criar arquivo:**
```bash
touch src/lib/validations/message.ts
```

**Conteúdo mínimo:**
```typescript
import { z } from "zod";

export const createMessageSchema = z.object({
  conversation_id: z.string().uuid("ID de conversa inválido"),
  content: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(2000, "Mensagem muito longa"),
});

export type CreateMessage = z.infer<typeof createMessageSchema>;
```

---

## 🗄️ SQL: Criar Tables (se não existirem)

```sql
-- Conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (conversations)
CREATE POLICY "Users can view conversations where they are owner or contact owner"
  ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies (messages)
CREATE POLICY "Users can view messages in conversations they have access"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in conversations they own"
  ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

---

## 🔧 Setup Inicial (Rodar uma vez)

```bash
# 1. Criar branch
git checkout -b sprint-5/chat

# 2. Estruturar pastas
mkdir -p src/app/\(dashboard\)/dashboard/conversas/{[id]}
mkdir -p src/components/chat

# 3. Criar arquivos de tipos
touch src/types/message.ts
touch src/lib/validations/message.ts

# 4. Criar pastas de testes
mkdir -p src/components/chat/__tests__
mkdir -p src/app/api/messages/__tests__

# 5. Instalar dependências (se precisar)
# npm install react-hook-form zod

# 6. Rodar dev
npm run dev
```

---

## 📝 Arquivos Base para Criar

### Day 1 (Seg 01/12)

**Arquivos obrigatórios:**

1. `src/app/(dashboard)/dashboard/conversas/page.tsx` (80 linhas)
2. `src/components/chat/conversation-list.tsx` (60 linhas)
3. `src/components/chat/conversation-item.tsx` (50 linhas)
4. `src/types/message.ts` (tipo)
5. `src/lib/validations/message.ts` (schema)

---

### Day 2 (Ter 02/12)

1. `src/app/(dashboard)/dashboard/conversas/[id]/page.tsx` (100 linhas)
2. `src/components/chat/chat-window.tsx` (50 linhas)
3. `src/components/chat/message-list.tsx` (70 linhas)
4. `src/components/chat/message-item.tsx` (60 linhas)

---

### Day 3 (Qua 03/12)

1. `src/app/api/messages/route.ts` (60 linhas)
2. `src/components/chat/message-input.tsx` (50 linhas)

---

### Day 4 (Qui 04/12)

1. `src/app/api/conversations/[id]/read/route.ts` (40 linhas)

---

## 🧪 Setup Testes (Opcional mas recomendado)

```bash
# Criar arquivo de teste base
touch src/components/chat/__tests__/chat.test.tsx

# Criar arquivo de teste API
touch src/app/api/messages/__tests__/route.test.ts
```

---

## ⚙️ Verificações Finais (Antes de Começar)

- [ ] Branch criado: `sprint-5/chat`
- [ ] Pastas criadas
- [ ] Types criados
- [ ] Schemas Zod criados
- [ ] Dev rodando sem erros: `npm run dev`
- [ ] Supabase conectando
- [ ] Auth funcionando (teste login)
- [ ] DB tables existem

---

## 🎯 Primeiro Commit

```bash
git add .
git commit -m "chore: setup Sprint 5 structure (chat feature)"
git push origin sprint-5/chat
```

---

## 📊 Paleta de Cores (Reutilizar Sprint 4)

```typescript
// Chat bubbles (use tailwind)
// User: bg-blue-500 text-white (direita)
// Contact: bg-gray-200 text-black (esquerda)
// Time: text-gray-500 text-xs
```

---

## 🔗 Reutilizar Padrões do Sprint 4

**Copiar essas estruturas:**

```typescript
// 1. Server-side auth
const { user } = await supabaseServer.auth.getUser();
if (!user) redirect("/login");

// 2. API error handling
return NextResponse.json(
  { error: "Mensagem de erro" },
  { status: 400 }
);

// 3. Toast notifications
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast();
toast({ title: "Sucesso!", description: "..." });

// 4. Form patterns
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const form = useForm({
  resolver: zodResolver(createMessageSchema),
});
```

---

## 🚫 Comum Pitfalls (Evitar)

1. ❌ Esquecer de chamar `getUser()` - Precisa verificar auth
2. ❌ Não criar índices - Queries vão ficar lentas
3. ❌ RLS policies erradas - Usuários não acessam dados
4. ❌ Sem validação Zod - Bug garantido
5. ❌ Sem testes - Vira produção com problema
6. ❌ Tentar fazer Realtime - Sai do escopo KISS

---

## 📞 Quick Reference

**Se não lembrar de algo, copie de:**

```
src/app/(dashboard)/dashboard/deals/pipeline/page.tsx
  ↓ Server-side logic

src/components/deals/deal-form.tsx
  ↓ Form patterns

src/app/api/deals/route.ts
  ↓ API patterns

src/components/deals/deal-card.tsx
  ↓ Component structure
```

---

## ✅ Status Atual (30/11/2025)

| Item | Status | Ação |
|------|--------|------|
| Sprint 4 completo | ✅ | Nada |
| DB tables | ❓ | Verificar |
| Types | ❌ | Criar |
| Schemas Zod | ❌ | Criar |
| Pastas | ❌ | Criar |
| Branch | ❌ | Criar |

---

## 🚀 Próximo Passo

**AGORA:** Execute as verificações acima
**DEPOIS:** Me comunica os resultados
**ENTÃO:** Começamos a implementação de verdade

---

**Checklist Criado em:** 30/11/2025  
**Versão:** 1.0  
**Status:** PRONTO PARA REVISAR
