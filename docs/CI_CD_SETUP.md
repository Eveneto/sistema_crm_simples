# 🔧 CI/CD Setup Guide

**Data:** 26 de novembro de 2025  
**Sprint:** 2  
**Status:** ✅ Configurado

---

## 📋 Overview

Implementamos um pipeline completo de CI/CD usando GitHub Actions com os seguintes fluxos:

1. **CI Pipeline** - Roda em push e PRs
2. **Deploy Staging** - Deploy automático em branches de sprint

---

## 🚀 Workflows Configurados

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**

- Push em branches: `main`, `sprint-*`
- Pull Requests para `main`

**Jobs:**

#### 1.1 Lint

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Run ESLint

#### 1.2 Test

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Run tests com coverage
- ✅ Upload coverage para Codecov (opcional)

#### 1.3 Build

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Build aplicação Next.js
- ✅ Verificar output `.next/`

#### 1.4 Type Check

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Run TypeScript compiler check

#### 1.5 E2E (Pull Requests apenas)

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Install Playwright + browsers
- ✅ Run Playwright tests
- ✅ Upload report como artifact

#### 1.6 Status Check

- ✅ Verifica se todos os jobs passaram
- ❌ Falha se qualquer job falhou

---

### 2. Deploy Staging (`.github/workflows/deploy-staging.yml`)

**Triggers:**

- Push em branches: `sprint-*`
- Manual dispatch

**Jobs:**

#### 2.1 Deploy to Vercel

- ✅ Checkout código
- ✅ Setup Node.js 20
- ✅ Run tests
- ✅ Build aplicação
- ✅ Deploy para Vercel Staging
- ✅ Comentar URL de deployment

---

## 🔑 Secrets Necessários

### GitHub Secrets

Configure em: `Settings` → `Secrets and variables` → `Actions`

#### Obrigatórios para Build:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

#### Obrigatórios para Deploy (Vercel):

```bash
VERCEL_TOKEN=xxx  # Token do Vercel
VERCEL_ORG_ID=xxx  # Org ID do Vercel
VERCEL_PROJECT_ID=xxx  # Project ID do Vercel
```

#### Opcionais:

```bash
CODECOV_TOKEN=xxx  # Token do Codecov (para coverage reports)
```

---

## 📝 Como Configurar Secrets

### 1. Supabase (Obrigatório)

Já configurado localmente, adicionar no GitHub:

```bash
# No GitHub: Settings → Secrets → New repository secret

Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: [copiar do arquivo .env.local]

Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: [copiar do arquivo .env.local]
```

### 2. Vercel (Para Deploy Staging)

#### Passo 1: Obter Vercel Token

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login e obter token
vercel login
vercel token create

# Copiar o token gerado
```

#### Passo 2: Obter Project IDs

```bash
# No diretório do projeto
vercel link

# Isso cria .vercel/project.json com:
# - orgId (VERCEL_ORG_ID)
# - projectId (VERCEL_PROJECT_ID)
```

#### Passo 3: Adicionar no GitHub

```bash
Nome: VERCEL_TOKEN
Valor: [token do passo 1]

Nome: VERCEL_ORG_ID
Valor: [orgId do .vercel/project.json]

Nome: VERCEL_PROJECT_ID
Valor: [projectId do .vercel/project.json]
```

### 3. Codecov (Opcional)

```bash
# Criar conta em codecov.io
# Conectar repositório GitHub
# Copiar token

Nome: CODECOV_TOKEN
Valor: [token do Codecov]
```

---

## ✅ Checklist de Setup

### Local

- [x] Workflows criados (ci.yml, deploy-staging.yml)
- [x] Migrations criadas
- [x] Dependencies instaladas (Playwright, etc)
- [ ] Testar workflow localmente com `act` (opcional)

### GitHub

- [ ] Repository secrets configurados (Supabase)
- [ ] Vercel secrets configurados (se usar deploy)
- [ ] Branch protection rules (opcional)
- [ ] Primeiro push para testar CI

### Vercel (Para Deploy)

- [ ] Projeto criado no Vercel
- [ ] `vercel link` executado
- [ ] Secrets configurados no GitHub
- [ ] Primeiro deploy manual para testar

---

## 🧪 Testando o CI/CD

### Teste 1: CI Pipeline

```bash
# Fazer mudança simples
echo "// test ci" >> src/app/page.tsx

# Commit e push
git add .
git commit -m "test: CI pipeline"
git push origin sprint-2

# Verificar em: GitHub → Actions
# ✅ Deve rodar: lint, test, build, type-check
```

### Teste 2: Pull Request

```bash
# Criar PR para main
gh pr create --base main --head sprint-2

# Verificar em: GitHub → Pull Requests
# ✅ Deve rodar: lint, test, build, type-check, e2e
```

### Teste 3: Deploy Staging (se configurado)

```bash
# Push em branch sprint-2
git push origin sprint-2

# Verificar em: GitHub → Actions → Deploy to Staging
# ✅ Deve fazer deploy no Vercel
```

---

## 📊 Status dos Workflows

| Workflow           | Status             | Quando Roda    | Tempo Médio |
| ------------------ | ------------------ | -------------- | ----------- |
| **CI Pipeline**    | ✅ Configurado     | Push, PR       | ~5-7 min    |
| **Deploy Staging** | ⚠️ Precisa secrets | Push sprint-\* | ~3-5 min    |
| **E2E Tests**      | ⚠️ Implementar     | PR apenas      | ~2-3 min    |

---

## 🎯 Próximos Passos

### Imediato

- [ ] Configurar secrets do Supabase no GitHub
- [ ] Testar CI pipeline com push
- [ ] Verificar se todos os jobs passam

### Opcional (Staging)

- [ ] Criar projeto no Vercel
- [ ] Configurar secrets do Vercel
- [ ] Testar deploy automático

### Sprint 2+

- [ ] Implementar testes E2E com Playwright
- [ ] Configurar branch protection rules
- [ ] Adicionar badges de status no README
- [ ] Configurar Codecov para coverage reports

---

## 🐛 Troubleshooting

### Erro: "npm ci" falha

**Solução:** Verificar package-lock.json commitado

### Erro: "NEXT_PUBLIC_SUPABASE_URL not found"

**Solução:** Configurar secrets no GitHub

### Erro: Build falha com TypeScript

**Solução:** Rodar `npx tsc --noEmit` localmente primeiro

### Erro: Testes falham no CI mas passam local

**Solução:** Verificar variáveis de ambiente, usar `--passWithNoTests`

### Erro: E2E timeout

**Solução:** Aumentar timeout do Playwright, verificar se navegador instalou

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Playwright CI Docs](https://playwright.dev/docs/ci)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)

---

## ✅ CI/CD Status

**Status Geral:** 🟢 **CONFIGURADO**

**Funcionalidades:**

- ✅ Lint automático
- ✅ Tests automáticos
- ✅ Build verification
- ✅ Type checking
- ⏳ E2E tests (quando implementar)
- ⏳ Deploy staging (quando configurar Vercel)

**Próxima Ação:** Configurar secrets e fazer primeiro push para testar

---

**Criado em:** Sprint 2 - Dia 1  
**Responsável:** Dev Team  
**Estimativa:** 3h (✅ Completo)
