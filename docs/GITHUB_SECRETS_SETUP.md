# 🔐 Guia de Configuração - GitHub Secrets

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Secrets Obrigatórios](#secrets-obrigatórios)
- [Passo a Passo](#passo-a-passo)
- [Secrets Opcionais](#secrets-opcionais)
- [Verificação](#verificação)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Os **GitHub Secrets** são variáveis de ambiente criptografadas que o GitHub Actions usa para executar os workflows de CI/CD sem expor informações sensíveis no código.

### Por que precisamos configurar?

- ✅ **CI Pipeline**: Testes precisam conectar ao Supabase
- ✅ **Deploy Staging**: Vercel precisa das credenciais do projeto
- ✅ **Segurança**: Nenhuma chave fica exposta no repositório

---

## 🔑 Secrets Obrigatórios

### 1. Secrets do Supabase (OBRIGATÓRIO AGORA)

Esses secrets são **necessários imediatamente** para o CI pipeline funcionar:

| Secret                          | Valor                                            | Onde Encontrar        |
| ------------------------------- | ------------------------------------------------ | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://ypyghhpaqxgdrbsozplj.supabase.co`       | `.env.local` linha 7  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_W9x_hPR-qiPD8xGh1HnQvg_2BVngx1a` | `.env.local` linha 10 |

⚠️ **ATENÇÃO**: Use a chave **ANON_KEY** (pública), **NÃO** use a SERVICE_ROLE_KEY nos secrets do GitHub!

### 2. Secrets do Vercel (OPCIONAL - PODE SER DEPOIS)

Necessários apenas para deploy automático no staging:

| Secret              | Como Obter                           |
| ------------------- | ------------------------------------ |
| `VERCEL_TOKEN`      | Dashboard Vercel → Settings → Tokens |
| `VERCEL_ORG_ID`     | Após rodar `vercel link` localmente  |
| `VERCEL_PROJECT_ID` | Após rodar `vercel link` localmente  |

---

## 📝 Passo a Passo - Configurar Secrets do Supabase

### **Passo 1: Acessar GitHub Secrets**

1. Acesse o repositório: https://github.com/Eveneto/sistema_crm_simples
2. Clique em **"Settings"** (aba no topo)
3. No menu lateral esquerdo, clique em **"Secrets and variables"**
4. Clique em **"Actions"**

![GitHub Secrets Menu](https://docs.github.com/assets/cb-45016/images/help/repository/repo-actions-settings.png)

---

### **Passo 2: Adicionar NEXT_PUBLIC_SUPABASE_URL**

1. Clique no botão verde **"New repository secret"**
2. Preencha os campos:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Secret: https://ypyghhpaqxgdrbsozplj.supabase.co
```

3. Clique em **"Add secret"** (botão verde)

✅ **Secret adicionado!**

---

### **Passo 3: Adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY**

1. Clique novamente em **"New repository secret"**
2. Preencha os campos:

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Secret: sb_publishable_W9x_hPR-qiPD8xGh1HnQvg_2BVngx1a
```

3. Clique em **"Add secret"**

✅ **Configuração do Supabase completa!**

---

### **Passo 4: Verificar Secrets Configurados**

Você deve ver na lista:

```
✅ NEXT_PUBLIC_SUPABASE_URL         Updated 1 minute ago
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY    Updated 1 minute ago
```

⚠️ **Importante**: GitHub **não mostra** os valores dos secrets por segurança. Você só verá quando foram atualizados.

---

## 🚀 Secrets Opcionais - Deploy Vercel

### **Como Obter os Secrets do Vercel**

#### 1. Instalar Vercel CLI (se não tiver)

```bash
npm i -g vercel
```

#### 2. Fazer Login no Vercel

```bash
vercel login
```

#### 3. Linkar o Projeto

```bash
cd /home/dev_pc/Documentos/crm_simplificado
vercel link
```

Responda:

- "Set up and deploy?" → **Yes**
- "Which scope?" → Selecione seu usuário/org
- "Link to existing project?" → **No** (se for novo) ou **Yes** (se já existe)
- "What's your project's name?" → `crm-simplificado`

#### 4. Obter VERCEL_ORG_ID e VERCEL_PROJECT_ID

```bash
cat .vercel/project.json
```

Copie os valores:

```json
{
  "orgId": "team_xxxxx",  ← VERCEL_ORG_ID
  "projectId": "prj_yyyy" ← VERCEL_PROJECT_ID
}
```

#### 5. Gerar VERCEL_TOKEN

1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Copie o token (só aparece uma vez!)

#### 6. Adicionar no GitHub

No GitHub Secrets, adicione:

- `VERCEL_TOKEN` → Token gerado
- `VERCEL_ORG_ID` → `team_xxxxx`
- `VERCEL_PROJECT_ID` → `prj_yyyy`

---

## ✅ Verificação - Testar CI Pipeline

### **Opção 1: Push Automático (já vai rodar)**

O CI pipeline já deve estar rodando automaticamente após o push que fizemos! 🚀

1. Acesse: https://github.com/Eveneto/sistema_crm_simples/actions
2. Você deve ver um workflow **"CI Pipeline"** rodando
3. Aguarde 3-5 minutos

**Status esperado:**

```
✅ lint       - Passed
✅ test       - Passed (30%+ coverage)
✅ build      - Passed
✅ type-check - Passed
⏭️ e2e        - Skipped (só roda em PRs)
✅ status-check - Passed
```

---

### **Opção 2: Trigger Manual (se precisar testar)**

```bash
# Faça uma pequena alteração
echo "# Test CI" >> README.md

# Commit e push
git add README.md
git commit -m "test: Verificar CI pipeline"
git push origin sprint-2
```

Então acesse: https://github.com/Eveneto/sistema_crm_simples/actions

---

## 🐛 Troubleshooting

### ❌ Erro: "Error: NEXT_PUBLIC_SUPABASE_URL is not defined"

**Causa**: Secret não configurado ou nome errado

**Solução**:

1. Verifique se o nome do secret está **exatamente** como: `NEXT_PUBLIC_SUPABASE_URL`
2. Sem espaços, sem typos
3. Delete e recrie o secret se necessário

---

### ❌ Erro: "Unauthorized: Invalid API key"

**Causa**: Usou a chave errada (SERVICE_ROLE_KEY em vez de ANON_KEY)

**Solução**:

1. Verifique se usou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. O valor deve começar com: `sb_publishable_` (não `sb_secret_`)
3. Atualize o secret com a chave correta

---

### ❌ Erro: "Tests failed - connection refused"

**Causa**: Supabase URL incorreta

**Solução**:

1. Copie novamente a URL do `.env.local`
2. Certifique-se que não tem espaços ou quebras de linha
3. URL deve ser: `https://ypyghhpaqxgdrbsozplj.supabase.co`

---

### ❌ Workflow não aparece no Actions

**Causa**: Workflow ainda não foi ativado

**Solução**:

1. Faça qualquer commit e push
2. O workflow será ativado automaticamente
3. Ou crie um PR para a branch main

---

### ❌ Deploy Staging falha: "Vercel token not found"

**Causa**: Secrets do Vercel não configurados

**Solução**:

1. Esse workflow é **opcional** agora
2. Configure os secrets do Vercel quando quiser ativar o deploy automático
3. Ou desabilite o workflow `deploy-staging.yml` temporariamente

---

## 📚 Recursos Adicionais

### Links Úteis

- 📖 [GitHub Secrets - Documentação Oficial](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- 🔐 [Supabase - API Keys](https://supabase.com/dashboard/project/ypyghhpaqxgdrbsozplj/settings/api)
- 🚀 [Vercel - Tokens](https://vercel.com/account/tokens)
- 📊 [GitHub Actions - Workflows](https://github.com/Eveneto/sistema_crm_simples/actions)

### Comandos Rápidos

```bash
# Ver status do repositório
git status

# Ver workflows do GitHub Actions
gh workflow list  # (requer GitHub CLI)

# Ver último run do CI
gh run list --limit 5

# Logs do último workflow
gh run view --log
```

---

## 🎯 Próximos Passos

Após configurar os secrets:

1. ✅ **Verificar CI Pipeline** (https://github.com/Eveneto/sistema_crm_simples/actions)
2. ✅ **Rodar migration do Supabase** (`npx supabase db push`)
3. ✅ **Começar US-008: Dashboard Principal**

---

## 📞 Ajuda

Se tiver problemas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Confira os logs no GitHub Actions
3. Peça ajuda no chat! 💬

---

**Última atualização**: 26/11/2024
**Sprint**: Sprint 2 - Dia 1
**Status**: ✅ Guia completo e testado
