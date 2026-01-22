# ✅ CHECKLIST INTERATIVO - VOLTA DE FÉRIAS

**Versão impressa - Use para marcar conforme você avança.**

---

## 📋 ANTES DE COMEÇAR

- [ ] Li `RESUMO_2_MINUTOS.md`
- [ ] Li `RESUMO_ANALISE_POS_FERIAS.md`
- [ ] Li `DASHBOARD_VISUAL_STATUS.md`
- [ ] Li `PLANO_ACAO_IMEDIATO.md`
- [ ] Abri o projeto no VS Code
- [ ] Fiz `npm install` (se necessário)
- [ ] Tenho acesso ao terminal

**Status:** [ ] Pronto para começar

---

## 🎯 FASE 1: DIAGNOSTICAR (30 min)

### Passo 1: Ver o estado atual

- [ ] Executei `npm run build`
- [ ] Anotei os erros exatos (copiar e colar aqui):

  ```
  ERRO AQUI:
  ___________________________________

  ```

- [ ] Executei `npm test 2>&1 | head -50` para ver primeiros testes falhando
- [ ] Anotei quais testes falharam (1-5 principais):
  ```
  TESTES QUEBRADOS:
  1. ________________
  2. ________________
  3. ________________
  ```

### Passo 2: Explorar o projeto

- [ ] Abri `/src` e explorei a estrutura
- [ ] Li `/src/app` e entendi as rotas
- [ ] Vi `/src/components` e entendi a organização
- [ ] Chequei `/src/lib/supabase.ts` para ver conexão com Supabase
- [ ] Vi pelo menos 1 arquivo de API em `/src/app/api`

### Passo 3: Entender o problema

- [ ] Entendi que build está falhando em static generation
- [ ] Identifiquei que `cookies()` é usado sem `'use server'`
- [ ] Entendi que preciso adicionar 'use server' ou converter para dynamic

**Status:** [ ] Diagnosticado completo

---

## 🔴 FASE 2: RESOLVER BUILD (1 hora)

### Build Error Resolution

- [ ] Fiz `grep -r "cookies()" src/app --include="*.tsx"` para achar problemas
- [ ] Encontrei problemas em:
  - [ ] src/app/(auth)/login/page.tsx
  - [ ] src/app/(auth)/register/page.tsx
  - [ ] src/app/(auth)/reset-password/page.tsx
  - [ ] src/app/(auth)/update-password/page.tsx
  - [ ] src/app/layout.tsx (talvez)
  - [ ] Outros: ******\_******

### Correção Aplicada

- [ ] Adicionei `'use server'` ou movei `cookies()` para server function:
  - [ ] login/page.tsx - [ ] ✅ FEITO
  - [ ] register/page.tsx - [ ] ✅ FEITO
  - [ ] reset-password/page.tsx - [ ] ✅ FEITO
  - [ ] update-password/page.tsx - [ ] ✅ FEITO
  - [ ] layout.tsx (se necessário) - [ ] ✅ FEITO

### Teste Build

- [ ] Executei `npm run build` novamente
- [ ] Build passou? [ ] SIM [ ] NÃO
  - Se NÃO, anote novo erro:
    ```
    NOVO ERRO:
    ___________________________________
    ```
- [ ] Executei `npm run build` terceira vez se necessário
- [ ] Build finalmente passou: [ ] SIM

### Commit

- [ ] Fiz `git add -A`
- [ ] Fiz `git commit -m "fix: resolve Next.js static generation errors"`
- [ ] Fiz `git push origin main` (ou sua branch)

**Status:** [ ] Build resolvido e commitado

---

## 🔧 FASE 3: CONFIGURAR PRODUÇÃO (5 min)

### Vercel Configuration

- [ ] Abri https://vercel.com/dashboard
- [ ] Acessei projeto "sistema-crm-simples"
- [ ] Fui para Settings → Environment Variables
- [ ] Cliquei "Add New"
- [ ] Preenchei:
  - Name: `NEXT_PUBLIC_APP_URL`
  - Value: Copiei de (procure na Overview): ******\_\_\_******
  - Selecionei:
    - [ ] Production
    - [ ] Preview
    - [ ] Development
- [ ] Cliquei "Save"
- [ ] Vercel está fazendo redeploy (espere 2-5 min)

### Teste

- [ ] Esperei redeploy completar
- [ ] Testei reset password em staging
- [ ] Email tinha link correto? [ ] SIM [ ] NÃO
  - Expected: `https://seu-dominio.vercel.app/update-password?token=...`

**Status:** [ ] Vercel configurado

---

## 🧪 FASE 4: CORRIGIR TESTES (2-3 horas)

### Análise de Testes Falhando

- [ ] Executei `npm test` completo
- [ ] Vi quantos testes passaram: `___` / 33
- [ ] Copiaste output para arquivo: `test-results.txt` [ ] SIM [ ] NÃO

### Categorizar Problemas

Procure no output por:

- [ ] "FAIL src/..." - Quantos? \_\_\_ (tipo: componentes)
- [ ] "Cannot find module" - Quantos? \_\_\_ (tipo: imports)
- [ ] "Mock error" - Quantos? \_\_\_ (tipo: setup)
- [ ] "Unexpected token" - Quantos? \_\_\_ (tipo: syntax)

### Corrigir Jest Config

- [ ] Revisei `jest.config.ts`
- [ ] Revisei `jest.setup.ts`
- [ ] Revisei `jest.polyfills.js`
- [ ] Identifiquei problemas em: ******\_\_\_******
- [ ] Corrigi problemas:
  - [ ] ✅ jest.config.ts
  - [ ] ✅ jest.setup.ts
  - [ ] ✅ jest.polyfills.js

### Corrigir Mocks

- [ ] Procurei por `jest.mock('@supabase'...)`
- [ ] Identifiquei mocks quebrados
- [ ] Atualizei mocks para Supabase v2.39:
  - [ ] createClient mock
  - [ ] supabase.auth mock
  - [ ] supabase.from mock

### Adicionar Testes do Chat

- [ ] Copiei padrão de `src/components/deals/__tests__/pipeline.test.tsx`
- [ ] Criei testes para:
  - [ ] `src/components/chat/message-input.test.tsx`
  - [ ] `src/components/chat/message-list.test.tsx`
  - [ ] `src/app/api/conversations/__tests__/route.test.ts`

### Teste Final

- [ ] Executei `npm test`
- [ ] Testes passando: `___` / 33
- [ ] Percentual: `___%`
- [ ] Meta (90%+)? [ ] SIM [ ] NÃO
  - Se não, identifiquei faltam:
    ```
    AINDA FALTAM:
    ________________
    ```

### Commit

- [ ] `git add -A && git commit -m "test: fix failing tests and add chat tests"`
- [ ] `git push`

**Status:** [ ] Testes corrigidos (90%+ passando)

---

## 💬 FASE 5: INTEGRAR CHAT COM AUTH (1 hora)

### Criar Hook de Auth

- [ ] Criei/revisei `src/hooks/use-auth.ts`
- [ ] Hook retorna: `{ user, loading }`
- [ ] Hook usa `supabase.auth.getUser()`
- [ ] Código testado em dev

### Usar Hook na Página de Conversas

- [ ] Abri `src/app/(dashboard)/dashboard/conversas/page.tsx`
- [ ] Adicionei `const { user, loading } = useAuth()`
- [ ] Passei `user.id` para componentes
- [ ] Removi mocks de currentUserId

### Atualizar Componentes Chat

- [ ] Procurei por `currentUserId = "user-mock"` ou similar
- [ ] Atualizei componentes:
  - [ ] ChatWindow.tsx
  - [ ] MessageInput.tsx
  - [ ] ConversationList.tsx
- [ ] Mudei de prop padrão para prop passada

### Testar em Dev

- [ ] Rodei `npm run dev`
- [ ] Abri http://localhost:3000/dashboard/conversas
- [ ] Criei nova conversa: [ ] ✅ Funcionou
- [ ] Enviei mensagem: [ ] ✅ Funcionou
- [ ] Vejo currentUserId real? [ ] ✅ SIM

### Testes

- [ ] Adicionei testes atualizados para componentes
- [ ] `npm test` passa?
  - [ ] SIM [ ] NÃO
  - Se não: ******\_\_\_******

### Commit

- [ ] `git add -A && git commit -m "feat: integrate chat with real authentication"`
- [ ] `git push`

**Status:** [ ] Chat integrado com auth real

---

## 📊 FASE 6: COMPLETAR SPRINT 4 (OPCIONAL - 4h)

Só faça se tiver tempo extra!

### Implementar DELETE

- [ ] Abri `src/app/api/deals/[id]/route.ts`
- [ ] Implementei `DELETE` handler
- [ ] Testei em dev: `curl -X DELETE /api/deals/id-123`
- [ ] Funcionou? [ ] ✅ SIM [ ] ❌ NÃO

### Implementar PATCH para mover estágios

- [ ] Implementei `PATCH` handler (atualizações)
- [ ] Posso mover deal entre estágios? [ ] ✅ SIM
- [ ] Testes passando? [ ] ✅ SIM

### Adicionar UI

- [ ] Adicionei botão DELETE em DealCard
- [ ] Adicionei lógica de mover entre estágios
- [ ] Testei em dev

### Testes

- [ ] Adicionei testes para DELETE
- [ ] Adicionei testes para PATCH
- [ ] `npm test` passa?

### Commit

- [ ] `git add -A && git commit -m "feat: complete sprint 4 - delete and move deals"`
- [ ] `git push`

**Status:** [ ] Sprint 4 completado (optional)

---

## 🚀 FASE 7: DEPLOY EM STAGING (30 min)

### Preparar

- [ ] Rodei `npm run build` (deve passar)
- [ ] Rodei `npm test` (90%+ deve passar)
- [ ] Tudo pronto? [ ] ✅ SIM [ ] ❌ NÃO

### Git

- [ ] `git checkout -b release/v0.1-beta`
- [ ] `git push origin release/v0.1-beta`

### Vercel

- [ ] Abri Vercel Dashboard
- [ ] Vi preview URL criada automaticamente
- [ ] Preview URL: ********\_\_\_********

### Teste Completo em Staging

Teste cada funcionalidade:

- [ ] Login - ✅ Funciona
- [ ] Register - ✅ Funciona
- [ ] Reset Password - ✅ Link correto
- [ ] Criar Contato - ✅ Funciona
- [ ] Listar Contatos - ✅ Funciona
- [ ] Editar Contato - ✅ Funciona
- [ ] Criar Negócio - ✅ Funciona
- [ ] Drag & Drop Kanban - ✅ Funciona
- [ ] Criar Conversa - ✅ Funciona
- [ ] Enviar Mensagem - ✅ Funciona
- [ ] Automações - ✅ Funciona
- [ ] Relatórios - ✅ Funciona

### Anotar Bugs

Se encontrou bugs:

```
BUG 1: ________________
Ação: __________________

BUG 2: ________________
Ação: __________________
```

### Ficar Bugs (se houver)

- [ ] Fixei todos os bugs encontrados
- [ ] Fiz novo commit: `git commit -m "fix: staging bugs"`
- [ ] Fiz push: `git push origin release/v0.1-beta`
- [ ] Vercel fez redeploy? (esperar 2-5 min)
- [ ] Testes funcionando em staging novamente?

**Status:** [ ] Staging validado e funcionando

---

## 🎉 FASE 8: DEPLOY EM PRODUÇÃO (30 min)

### Merge para Main

- [ ] Revisei todos os commits
- [ ] Tudo ok? [ ] ✅ SIM [ ] ❌ NÃO
- [ ] `git checkout main`
- [ ] `git merge release/v0.1-beta`
- [ ] `git push origin main`

### Vercel Deploy

- [ ] Abri Vercel Dashboard
- [ ] Vi novo deployment em main
- [ ] Status: [ ] Building [ ] Ready [ ] Error
- [ ] Esperou completar (5-10 min): [ ] ✅ FEITO

### Verificar Produção

- [ ] Abri https://seu-dominio.vercel.app
- [ ] Página carregou? [ ] ✅ SIM
- [ ] Fiz login? [ ] ✅ FUNCIONOU
- [ ] Criei contato? [ ] ✅ FUNCIONOU
- [ ] Sistema está rápido? [ ] ✅ SIM

### Monitorar (próximas 30 min)

- [ ] Verificar logs em Vercel Dashboard
- [ ] Erros? [ ] NÃO [ ] SIM (qual?)
- [ ] Performance ok? [ ] ✅ SIM
- [ ] Usuarios conseguem usar? [ ] ✅ SIM

### Commit Tag (optional)

- [ ] `git tag -a v0.1.0 -m "Release 0.1.0 - CRM MVP"`
- [ ] `git push origin v0.1.0`

**Status:** [ ] PRODUÇÃO LIVE! 🎉

---

## 📊 RESUMO FINAL

### Tempo Gasto

- Fase 1 (Diagnosticar): **\_** min
- Fase 2 (Build): **\_** min
- Fase 3 (Config): **\_** min
- Fase 4 (Testes): **\_** min
- Fase 5 (Chat): **\_** min
- Fase 6 (Sprint 4): **\_** min (optional)
- Fase 7 (Staging): **\_** min
- Fase 8 (Produção): **\_** min

**TOTAL: **\_** horas**

### Resultado Final

- [ ] Build passando ✅
- [ ] Testes passando (90%+) ✅
- [ ] Dev funcionando ✅
- [ ] Staging validado ✅
- [ ] Produção live ✅

### Features Funcionando

- [ ] Autenticação
- [ ] Contatos (CRUD)
- [ ] Negócios/Pipeline
- [ ] Chat/Conversas
- [ ] Automações
- [ ] Tarefas
- [ ] Notificações
- [ ] Relatórios

### Checklist de Qualidade

- [ ] Código está clean
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Deploy automático configurado
- [ ] Monitoramento ativo

---

## 🎊 CELEBRAÇÃO FINAL

```
██████████████████████████████████████████
███  🎉 PROJETO PRONTO PARA PRODUÇÃO! 🎉  ███
██████████████████████████████████████████

✅ Build passando
✅ Testes OK
✅ Dev funcionando
✅ Staging validado
✅ Produção LIVE
✅ Documentação atualizada

PARABÉNS! 🚀
Você terminou o projeto com sucesso!
```

---

## 📞 PRÓXIMAS AÇÕES

- [ ] Avisar time que sistema está pronto
- [ ] Treinar usuários (se necessário)
- [ ] Monitorar produção (primeira semana)
- [ ] Planejar Sprint 6 (novas features)
- [ ] Fazer retrospectiva

---

**Data de conclusão:** ******\_******

**Assinado (opcional):** ******\_******

---

_Checklist criado em 22 de janeiro de 2026_
