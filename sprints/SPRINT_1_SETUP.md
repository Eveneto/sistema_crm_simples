# Sprint 1 - Guia de Execução

## 🚀 Passo a Passo para Começar

### 1. Instalar Dependências do Supabase

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Instalar Componentes shadcn/ui

```bash
# Componentes necessários para Sprint 1
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sonner
```

### 3. Configurar Supabase

#### 3.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Preencha:
   - **Nome:** crm-simplificado
   - **Database Password:** [Crie uma senha forte]
   - **Region:** South America (São Paulo)
5. Aguarde ~2 minutos (criação do projeto)

#### 3.2 Copiar Credenciais

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3.3 Configurar .env.local

Edite o arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3.4 Executar Migrations SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em "Run" (aguarde ~10 segundos)
5. Repita para `supabase/migrations/002_row_level_security.sql`

**Verificação:**

- Vá em **Table Editor**
- Você deve ver as tabelas: user_profiles, contacts, channels, conversations, messages, deals, deal_stages, activities

#### 3.5 Configurar Autenticação

1. Vá em **Authentication > Providers**
2. Habilite **Email**:
   - ✅ Enable Email provider
   - ✅ Confirm email: Disabled (para desenvolvimento, habilite em produção)
3. Salve

### 4. Rodar o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📋 Checklist de Setup

- [ ] Dependências instaladas (`npm install`)
- [ ] @supabase/supabase-js e @supabase/ssr instalados
- [ ] Componentes shadcn/ui instalados
- [ ] Projeto Supabase criado
- [ ] .env.local configurado com credenciais
- [ ] Migrations SQL executadas (001 e 002)
- [ ] Email auth habilitado no Supabase
- [ ] Projeto rodando sem erros (`npm run dev`)

---

## 🔄 Próximas Tarefas de Desenvolvimento

Agora que o setup está completo, vamos desenvolver as User Stories na ordem:

### Fase 1: Autenticação (Dias 1-3)

1. **US-001:** Página de login + formulário
2. **US-002:** Página de registro
3. **US-003:** Recuperação de senha

### Fase 2: Layout (Dias 4-6)

4. **US-012:** Sidebar com navegação
5. **US-013:** Header com perfil do usuário
6. **US-014:** Toggle de tema dark/light

### Fase 3: Permissões e Refinamento (Dias 7-10)

7. **US-004:** Sistema de roles (admin/manager/agent)
8. **US-005:** Middleware de proteção de rotas (já criado)
9. Testes e bug fixes

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@supabase/ssr'"

```bash
npm install @supabase/ssr
```

### Erro: Supabase connection failed

- Verifique se as credenciais em `.env.local` estão corretas
- Confirme que o projeto Supabase está ativo (não pausado)

### Erro: SQL execution failed

- Verifique se executou as migrations na ordem correta
- Tente executar uma por vez
- Verifique os logs de erro no Supabase

### Build falha com TypeScript errors

```bash
# Verificar tipos
npm run type-check

# Se necessário, reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Próximos Documentos a Criar

Conforme desenvolvemos, criaremos:

- [ ] Componentes de formulário (LoginForm, RegisterForm)
- [ ] Páginas de autenticação
- [ ] Componentes de layout (Sidebar, Header)
- [ ] Store Zustand para auth
- [ ] Testes unitários

---

**Status:** ✅ Setup completo, pronto para desenvolvimento!
