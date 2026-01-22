# 🎯 PLANO DE AÇÃO IMEDIATO - VOLTA DE FÉRIAS

**Data:** 22 de janeiro de 2026  
**Objetivo:** Deixar o projeto 100% pronto para produção  
**Tempo estimado:** 8-10 horas concentradas

---

## ⚡ AÇÃO 1: Entender o Estado Atual (15 min)

### 1.1 Leia a análise

```bash
# Primeiro, leia esses dois documentos:
1. RESUMO_ANALISE_POS_FERIAS.md (10 min)
2. DASHBOARD_VISUAL_STATUS.md (5 min)

# Agora você sabe o estado do projeto
```

### 1.2 Explore o código

```bash
# Rodar o projeto em dev
npm install  # Se necessário
npm run dev

# Abrir em http://localhost:3000
# Tentar login, explorar funcionalidades
# Ver quais páginas funcionam
```

---

## 🔴 AÇÃO 2: Resolver Build Failure (45 min) - CRÍTICO

Este é o bloqueador mais importante!

### Passo 1: Entender o erro

```bash
# Executar build
npm run build

# Anote os erros. Provavelmente será algo como:
# "Dynamic server usage (cookies) outside of response handling"
# nas páginas: login, register, reset-password, update-password
```

### Passo 2: Identificar o problema

O problema está em um desses lugares:

```typescript
// ❌ PROBLEMA: Usar cookies() em component direto
export default function LoginPage() {
  const cookies = cookies(); // ❌ Erro!
  // ...
}

// ✅ CORRETO: Usar 'use server'
('use server');
export default function LoginPage() {
  const cookies = cookies(); // ✅ OK
  // ...
}

// OU converter para server component
async function getAuthStatus() {
  const cookies = cookies(); // ✅ OK em server function
  // ...
}
```

### Passo 3: Procurar pelos problemas

```bash
# Procurar por 'cookies()' no código
grep -r "cookies()" src/app --include="*.tsx" --include="*.ts"

# Arquivos que provavelmente têm problema:
# src/app/(auth)/login/page.tsx
# src/app/(auth)/register/page.tsx
# src/app/(auth)/reset-password/page.tsx
# src/app/(auth)/update-password/page.tsx
# src/app/layout.tsx
```

### Passo 4: Corrigir cada page

Exemplo de correção:

**ANTES (❌ erro):**

```typescript
// src/app/(auth)/login/page.tsx
import { cookies } from 'next/headers';

export default function LoginPage() {
  const cookies = cookies();
  // ...
}
```

**DEPOIS (✅ ok):**

```typescript
// src/app/(auth)/login/page.tsx
import { cookies } from 'next/headers'

export default function LoginPage() {
  // Remova o uso de cookies() aqui
  // Se precisar de cookies, mova para um server component
  return <LoginForm />
}

// Crie um server component se necessário
async function getAuthStatus() {
  const cookies = cookies()  // OK aqui
  // ...
}
```

**OU adicione 'use server' se for usar server-side:**

```typescript
// src/app/(auth)/login/page.tsx
'use server'; // ← Adicione isso no topo!

import { cookies } from 'next/headers';

export default function LoginPage() {
  const cookies = cookies(); // Agora OK
  // ...
}
```

### Passo 5: Testar build novamente

```bash
npm run build
# Se passar, continue!
# Se não passar, anote o erro e siga para o próximo
```

### Passo 6: Commit

```bash
git add -A
git commit -m "fix: resolve Next.js static generation errors"
git push
```

---

## 🔧 AÇÃO 3: Configurar URLs de Produção (5 min)

Isso é simples mas ESSENCIAL para reset de senha funcionar em produção!

### Passo 1: Ir para Vercel

```
https://vercel.com/dashboard
```

### Passo 2: Acessar o projeto

```
Clique em: sistema-crm-simples (ou seu projeto)
```

### Passo 3: Ir para Settings

```
Settings → Environment Variables
```

### Passo 4: Adicionar variável

```
Name:  NEXT_PUBLIC_APP_URL
Value: https://sistema-crm-simples-zeb2.vercel.app

(Ou copie a URL do seu deploy do Vercel)

Selecionar:
  ☑ Production
  ☑ Preview
  ☑ Development
```

### Passo 5: Salvar

```
Clique "Save"
Vercel fará redeploy automático
```

### Passo 6: Testar

```
Depois de alguns minutos:
1. Abrir https://seu-dominio.vercel.app/reset-password
2. Enviar um teste de reset
3. Verificar email
4. O link DEVE conter seu domínio
   ✅ https://seu-dominio.vercel.app/update-password?token=...
   ❌ NÃO deve ter localhost
```

---

## 🧪 AÇÃO 4: Corrigir Testes (2-3 horas)

### Passo 1: Ver quais testes estão falhando

```bash
npm test 2>&1 | tee test-output.txt

# Anote os testes que falharam
# Procure por:
# - FAIL src/...
# - ✕ test name
# - Error: ...
```

### Passo 2: Categorizar os problemas

```
Tipo 1: Testes do componente X (25%)
Tipo 2: Mock do Supabase quebrado (30%)
Tipo 3: Faltam testes (45%)
```

### Passo 3: Corrigir setup

Revisar e atualizar:

- `jest.config.ts` - Config do Jest
- `jest.setup.ts` - Setup inicial
- `jest.polyfills.js` - Polyfills

### Passo 4: Corrigir mocks

Procurar por mocks do Supabase e atualizar para versão correta.

Exemplo de mock que pode estar quebrado:

```typescript
// ❌ Quebrado
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// ✅ Correto
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      // ... outros métodos
    },
    from: jest.fn(),
    // ... outros métodos
  })),
}));
```

### Passo 5: Adicionar testes do Chat (novo)

O Chat MVP foi adicionado, precisa testes. Criar:

```
src/components/chat/__tests__/message-input.test.tsx
src/components/chat/__tests__/message-list.test.tsx
src/app/api/conversations/__tests__/route.test.ts
```

Copiar padrão dos testes da Sprint 4:

- `src/components/deals/__tests__/pipeline.test.tsx`
- `src/app/api/deals/__tests__/route.test.ts`

### Passo 6: Rodar novamente

```bash
npm test -- --updateSnapshot  # Se snapshots mudaram
npm test                       # Deve melhorar a taxa de passa

# Meta: 90%+ de testes passando
```

### Passo 7: CI Coverage

```bash
npm run test:ci  # Simular CI environment
```

---

## 💬 AÇÃO 5: Integrar Chat com Auth (45 min)

O código do Chat está pronto, apenas precisa pegar o usuário real!

### Passo 1: Criar hook de autenticação

```typescript
// src/hooks/use-auth.ts (se não existir)

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter usuário atual
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email } : null);
      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
}
```

### Passo 2: Usar hook na página de conversas

```typescript
// src/app/(dashboard)/dashboard/conversas/page.tsx

'use client'

import { useAuth } from '@/hooks/use-auth'

export default function ConversasPage() {
  const { user, loading } = useAuth()

  if (loading) return <div>Carregando...</div>
  if (!user) return <div>Não autenticado</div>

  // Agora use user.id em vez de mock!
  return <ChatWindow currentUserId={user.id} />
}
```

### Passo 3: Atualizar componentes do Chat

Procurar por `currentUserId = "user-mock"` e substituir por prop real:

```typescript
// ❌ Antes
interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const currentUserId = "user-mock"  // ❌ Mock!

// ✅ Depois
interface ChatWindowProps {
  conversationId: string
  currentUserId: string  // Agora é prop!
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  // Usa currentUserId da prop
```

### Passo 4: Testar em dev

```bash
npm run dev
# Ir para: http://localhost:3000/dashboard/conversas
# Tentar criar conversa
# Enviar mensagem
# Ver se funciona
```

### Passo 5: Adicionar testes

```typescript
// src/components/chat/__tests__/chat-window.test.tsx

describe('ChatWindow', () => {
  it('deve enviar mensagem com currentUserId correto', async () => {
    const { getByTestId } = render(
      <ChatWindow
        conversationId="conv-1"
        currentUserId="user-123"
      />
    )

    // ... resto do teste
  })
})
```

---

## 📋 AÇÃO 6: Completar Sprint 4 (4 horas)

Se tiver tempo, terminar o Pipeline Kanban:

### Faltam esses endpoints:

```typescript
// src/app/api/deals/[id]/route.ts

// ❌ DELETE ainda não implementado
export async function DELETE(request: Request, { params }: RouteParams) {
  // Implementar delete de deal
}

// ❌ PATCH para mover entre estágios
export async function PATCH(request: Request, { params }: RouteParams) {
  // Implementar atualização (especialmente stage)
}
```

### Tarefas:

1. Implementar DELETE deals (20 min)
2. Implementar PATCH deals (20 min)
3. Testar endpoints (20 min)
4. Adicionar componentes de ação (delete button) (30 min)
5. Testes (20 min)

Copiar padrão do código já existente na Sprint 4.

---

## 🚀 AÇÃO 7: Deploy em Staging (30 min)

### Passo 1: Criar branch

```bash
git checkout -b release/v0.1-beta
```

### Passo 2: Fazer push

```bash
git push origin release/v0.1-beta
```

### Passo 3: Deploy automático

```
Vercel detectará novo branch
Vercel criará preview URL automaticamente
```

### Passo 4: Testar em staging

```
1. Abrir preview URL do Vercel
2. Teste cada funcionalidade:
   ✅ Login
   ✅ Criar contato
   ✅ Ver contatos
   ✅ Criar negócio
   ✅ Drag & drop no kanban
   ✅ Criar conversa
   ✅ Enviar mensagem
   ✅ Reset password (verificar email)
3. Anotar bugs encontrados
4. Fix bugs
5. Push fixes
6. Redeploy automático
```

### Passo 5: Testar auth links

```
1. Ir para: preview-url/reset-password
2. Enviar teste de reset
3. Verificar email
4. Link deve ter preview-url (não localhost)
```

---

## 🎉 AÇÃO 8: Deploy em Produção (30 min)

Quando tudo estiver ok em staging:

### Passo 1: Merge para main

```bash
git checkout main
git merge release/v0.1-beta
git push origin main
```

### Passo 2: Deploy automático

```
Vercel detectará push para main
Vercel fará deploy automático em produção
```

### Passo 3: Verificar deployment

```
Vercel Dashboard → Deployments
Status deve ser: ✅ Ready
```

### Passo 4: Smoke test em produção

```
1. Abrir https://sistema-crm-simples-zeb2.vercel.app
2. Testar login
3. Testar algumas funcionalidades
4. Reset password
5. Ver analytics
```

### Passo 5: Monitorar

```
Primeiras 30 minutos:
- Ver se tem erros
- Ver performance
- Ver logs
```

---

## 📊 TIMELINE SUGERIDA

```
HOJE (Segunda):
├─ 8:00-8:15  AÇÃO 1: Entender estado (15 min)
├─ 8:15-9:00  AÇÃO 2: Resolver build (45 min)
├─ 9:00-9:05  AÇÃO 3: Configurar Vercel (5 min)
├─ 9:05-12:00 AÇÃO 4: Testes (3h)
└─ 12:00-1:00 Almoço

TARDE:
├─ 1:00-2:00  AÇÃO 5: Chat auth (1h)
├─ 2:00-3:00  AÇÃO 6: Sprint 4 se tiver tempo (1h)
├─ 3:00-3:30  AÇÃO 7: Deploy staging (30 min)
└─ 3:30-4:00  Testar, ficar bugs

PRÓXIMOS DIAS:
├─ Terça:      AÇÃO 6 completo se não fez + mais testes
├─ Quarta:     QA final, smoke tests
└─ Quinta:     AÇÃO 8: Deploy produção + celebrar!
```

---

## ✅ CHECKLIST COMPLETO

### Dia 1:

- [ ] Ler RESUMO_ANALISE_POS_FERIAS.md
- [ ] Ler DASHBOARD_VISUAL_STATUS.md
- [ ] npm run build (vai falhar)
- [ ] Resolver build errors
- [ ] npm run build (deve passar)
- [ ] Configurar NEXT_PUBLIC_APP_URL no Vercel
- [ ] npm test
- [ ] Corrigir alguns testes básicos
- [ ] Commit

### Dia 2:

- [ ] Continuar corrigindo testes
- [ ] Integrar Chat com auth
- [ ] npm run dev + testar Chat
- [ ] Adicionar testes do Chat
- [ ] npm test (90%+ passando)
- [ ] Commit

### Dia 3:

- [ ] Completar Sprint 4 (optional)
- [ ] QA final em dev
- [ ] npm run build
- [ ] Deploy em staging
- [ ] Testar tudo em staging
- [ ] Fix bugs encontrados

### Dia 4-5:

- [ ] Smoke tests finais
- [ ] Deploy em produção
- [ ] Monitorar
- [ ] 🎉 Celebrar!

---

## 🆘 AJUDA RÁPIDA

### Se build falhar com erro X:

```
Erro: "Dynamic server usage"
→ Leia a AÇÃO 2 acima

Erro: "Cannot find module"
→ npm install
→ Verificar imports

Erro: "Type 'X' is not assignable to type 'Y'"
→ npm run type-check
→ Revisar tipos

Erro: "RLS policy error"
→ Verificar RLS policies no Supabase
→ Ou desativar RLS temporariamente para debug
```

### Se teste falhar:

```
Revisar:
1. jest.config.ts está correto?
2. Mocks estão corretos?
3. Setup.ts está rodando?
4. Test file está bem estruturado?
5. Dependencies estão instaladas?
```

### Se deploy falhar:

```
Verificar:
1. Build local passou?
2. npm run build
3. Variáveis de ambiente no Vercel?
4. Webhooks corretos?
5. Supabase credentials válidas?
```

---

## 💡 DICAS DE OURO

1. **Commit frequentemente:** A cada AÇÃO completa, faça commit
2. **Teste em dev primeiro:** Sempre `npm run dev` antes de push
3. **Leia os erros:** Next.js dá boas mensagens de erro, leia completamente
4. **Use DevTools:** React DevTools + Supabase Studio são seus amigos
5. **Documente:** Se descobrir algo novo, atualize a documentação
6. **Backup:** Antes de mudanças grandes, crie branch novo

---

## 🎯 META FINAL

Quando tudo isso estar pronto:

```
✅ Build passando
✅ Testes passando (90%+)
✅ Deploy em staging testado
✅ Deploy em produção feito
✅ Todas as features funcionando
✅ URLs corretas
✅ Documentação atualizada

🎉 PROJETO PRONTO PARA USUÁRIOS!
```

---

**Boa sorte! Você consegue! 💪**

_Se tiver dúvidas, releia os documentos ou procure pela documentação na pasta `docs/`_

Tempo total estimado: 8-10 horas concentradas (ou 2-3 dias)
