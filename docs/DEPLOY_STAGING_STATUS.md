# 🚀 Deploy Staging - Status e Decisão

**Data**: 26/11/2024  
**Sprint**: Sprint 2 - Dia 1  
**Status**: ⏸️ **Desabilitado Temporariamente**

---

## 📊 Status Atual

### ✅ **CI Pipeline - FUNCIONANDO**

```yaml
Workflow: CI Pipeline (.github/workflows/ci.yml)
Status: ✅ PASSING
Jobs: ✅ lint       - ESLint validation
  ✅ test       - Jest (18/18 tests, 100% pass)
  ✅ build      - Next.js production build
  ✅ type-check - TypeScript compilation
  ✅ status-check - All checks passed
```

**Última execução**: Commit 4f5ca5b  
**Resultado**: ✅ **SUCCESS**

---

### ⏸️ **Deploy Staging - DESABILITADO**

```yaml
Workflow: Deploy to Staging (.github/workflows/deploy-staging.yml)
Status: ⏸️ DESABILITADO (comentado push trigger)
Motivo: Secrets do Vercel não configurados
```

**Erro anterior**:

```
Error! Unexpected error. Please try again later. ()
The process '/opt/hostedtoolcache/node/20.19.5/x64/bin/npx' failed with exit code 1
```

**Causa**: Falta dos secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 🎯 Decisão Executiva

### **DESABILITAR Deploy Staging Temporariamente**

**Justificativa**:

1. ✅ **CI Pipeline funcionando** - Principal objetivo alcançado
2. ✅ **Testes 100% passando** - Qualidade garantida
3. ✅ **Build OK** - Aplicação compila sem erros
4. ⚠️ **Deploy staging é opcional** para desenvolvimento local
5. 🎯 **Tempo é crítico** - Foco deve ser no Dashboard (US-008)

**Impacto**:

- ✅ **Zero impacto** no desenvolvimento local
- ✅ **CI continua validando** código a cada push
- ⚠️ **Preview URLs não são geradas** automaticamente
- 💡 **Deploy manual ainda funciona** via `workflow_dispatch`

---

## 🔧 Como Funciona Agora

### **Push para sprint-2**

```yaml
1. ✅ CI Pipeline executa automaticamente
- lint → test → build → type-check

2. ⏸️ Deploy Staging NÃO executa
- Trigger comentado
- Não tenta conectar ao Vercel
- Sem erros de secrets faltando
```

### **Deploy Manual (opcional)**

Se precisar fazer deploy:

```bash
# 1. Configure secrets primeiro (ver seção abaixo)
# 2. Vá em: Actions → Deploy to Staging → Run workflow
# 3. Selecione branch → Run workflow
```

---

## 📝 Como Habilitar Deploy Staging (quando necessário)

### **Passo 1: Configurar Secrets do Vercel**

#### 1.1 Instalar Vercel CLI

```bash
npm i -g vercel
```

#### 1.2 Fazer Login

```bash
vercel login
```

#### 1.3 Linkar Projeto

```bash
cd /home/dev_pc/Documentos/crm_simplificado
vercel link
```

Responda:

- "Set up and deploy?" → **Yes**
- "Which scope?" → Selecione seu usuário/org
- "Link to existing project?" → **No** (ou **Yes** se já existe)
- "What's your project's name?" → `crm-simplificado`

#### 1.4 Obter IDs

```bash
cat .vercel/project.json
```

Copie:

```json
{
  "orgId": "team_xxxxx", // ← VERCEL_ORG_ID
  "projectId": "prj_yyyy" // ← VERCEL_PROJECT_ID
}
```

#### 1.5 Gerar Token

1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions - CRM`
4. Scope: **Full Account**
5. Expiration: 1 year (ou conforme necessário)
6. Copie o token (só aparece uma vez!)

---

### **Passo 2: Adicionar Secrets no GitHub**

1. Acesse: https://github.com/Eveneto/sistema_crm_simples/settings/secrets/actions

2. Clique em **"New repository secret"** (3 vezes)

3. Adicione:

```
Name: VERCEL_TOKEN
Secret: vercel_token_aqui_xxxxx

Name: VERCEL_ORG_ID
Secret: team_xxxxx

Name: VERCEL_PROJECT_ID
Secret: prj_yyyy
```

---

### **Passo 3: Reativar Workflow**

Edite `.github/workflows/deploy-staging.yml`:

```yaml
# ANTES (desabilitado):
on:
  # push:
  #   branches: [sprint-2, sprint-3, sprint-4, sprint-5, sprint-6]
  workflow_dispatch:

# DEPOIS (habilitado):
on:
  push:
    branches: [sprint-2, sprint-3, sprint-4, sprint-5, sprint-6]
  workflow_dispatch:
```

Commit e push:

```bash
git add .github/workflows/deploy-staging.yml
git commit -m "feat: Habilitar deploy staging com secrets configurados"
git push origin sprint-2
```

---

### **Passo 4: Verificar**

1. Acesse: https://github.com/Eveneto/sistema_crm_simples/actions
2. Aguarde workflow **"Deploy to Staging"** executar
3. Verifique URL de preview nos logs

---

## 📊 Comparação: Com vs Sem Deploy Staging

| Aspecto              | Sem Deploy    | Com Deploy              |
| -------------------- | ------------- | ----------------------- |
| CI Validation        | ✅ Funciona   | ✅ Funciona             |
| Testes automatizados | ✅ 18 testes  | ✅ 18 testes            |
| Build validation     | ✅ OK         | ✅ OK                   |
| Preview URLs         | ❌ Não gera   | ✅ Gera automaticamente |
| Deploy automático    | ❌ Manual     | ✅ Automático           |
| Tempo de setup       | ✅ 0 min      | ⚠️ 15-20 min            |
| Custo Vercel         | ✅ $0 (local) | ⚠️ Hobby plan OK        |

---

## 🎯 Recomendação para Sprint 2

### **MANTER DESABILITADO até finalizar US-008**

**Por quê?**

1. ✅ CI já valida tudo que precisamos
2. ✅ Desenvolvimento local é suficiente
3. 🎯 Tempo crítico para entregar features
4. 💡 Pode ser habilitado em 15-20 min quando necessário

**Quando habilitar?**

- ✅ Após completar Dashboard (US-008, 009, 010)
- ✅ Após completar Contacts CRUD (US-017-022)
- ✅ Antes da Sprint Review (Demo para stakeholders)
- ✅ Quando precisar compartilhar preview com time

---

## 📚 Referências

### **Documentação**

- `docs/GITHUB_SECRETS_SETUP.md` - Guia completo de secrets
- `docs/CI_CD_SETUP.md` - Setup geral do CI/CD
- `.github/workflows/deploy-staging.yml` - Workflow de deploy

### **Links Úteis**

- 🔐 [GitHub Secrets](https://github.com/Eveneto/sistema_crm_simples/settings/secrets/actions)
- 🚀 [Vercel Dashboard](https://vercel.com/dashboard)
- 🎬 [GitHub Actions](https://github.com/Eveneto/sistema_crm_simples/actions)
- 📖 [Vercel CLI Docs](https://vercel.com/docs/cli)

---

## 🏁 Resumo Executivo

### ✅ **O que está funcionando**:

- CI Pipeline (lint, test, build, type-check)
- Testes 100% passando (18/18)
- Build successful
- Desenvolvimento local

### ⏸️ **O que está desabilitado**:

- Deploy automático para Vercel staging
- Preview URLs automáticas

### 🎯 **Próximos passos**:

1. ✅ Continuar desenvolvimento (US-008: Dashboard)
2. ⏯️ Habilitar deploy staging quando necessário
3. ✅ Configurar secrets do Vercel (15-20 min)

---

## 💬 FAQ

### **P: Preciso do deploy staging para desenvolver?**

R: ❌ Não! Desenvolvimento local (`npm run dev`) é suficiente.

### **P: Como testar sem deploy staging?**

R: ✅ Use `npm run build` + `npm start` localmente para testar produção.

### **P: E se eu quiser mostrar para alguém?**

R: 💡 3 opções:

1. Deploy manual via `vercel --prod`
2. Compartilhar localhost via ngrok/tunneling
3. Habilitar workflow de staging

### **P: Quando devo habilitar?**

R: 📅 Antes da Sprint Review ou quando precisar compartilhar previews.

### **P: Vai quebrar algo?**

R: ❌ Não! CI continua validando tudo. Deploy é apenas uma conveniência.

---

**Status Final**: ✅ **CI FUNCIONANDO** | ⏸️ **Deploy DESABILITADO (propositalmente)**  
**Decisão**: ✅ **APROVADA** - Focar em features primeiro, deploy depois

🚀 **Continue com US-008: Dashboard!**
