# 🗄️ Alterações no Banco de Dados - US-031 Analytics

**Data:** 28 de novembro de 2025  
**Migration:** `20241128_add_analytics_fields.sql`

---

## 📋 Resumo das Alterações

A implementação da US-031 (Analytics Avançado) requer **3 novos campos** na tabela `deals` e **1 trigger** para manter dados sincronizados.

---

## ✅ Campos Adicionados

### 1. `deals.probability` (INTEGER)

**Propósito:** Armazenar a probabilidade de fechamento do deal (0-100%)

**Uso no Analytics:**
- Cálculo de **receita esperada**: `value * (probability / 100)`
- **Forecast realista**: Projeção baseada em probabilidade
- **Confiança do forecast**: Média das probabilidades

**Exemplo:**
```sql
-- Deal com 70% de chance de fechar
INSERT INTO deals (title, value, probability, stage) 
VALUES ('Projeto XYZ', 50000, 70, 'negotiation');

-- Receita esperada: R$ 50.000 * 0.70 = R$ 35.000
```

**Constraints:**
- Valor entre 0 e 100
- Default: 50%

---

### 2. `deals.user_id` (UUID)

**Propósito:** Identificar o **dono/criador** do deal

**Diferença de `assigned_to`:**
- `user_id` = quem **criou/possui** o deal (não muda)
- `assigned_to` = quem está **responsável** no momento (pode mudar)

**Uso no Analytics:**
- Filtrar métricas **por vendedor**
- Calcular **performance individual**
- Análise de **produtividade**

**Exemplo:**
```sql
-- João criou o deal, mas Maria está responsável
INSERT INTO deals (title, user_id, assigned_to) 
VALUES ('Deal ABC', 'joao-uuid', 'maria-uuid');
```

---

### 3. `deals.stage` (TEXT)

**Propósito:** Campo de texto para facilitar queries (mantém compatibilidade com `stage_id`)

**Valores possíveis:**
- `lead` - Sem contato
- `qualified` - Prospecção/Qualificação
- `proposal` - Proposta enviada
- `negotiation` - Negociação ativa
- `won` - Ganho/Fechado
- `lost` - Perdido

**Uso no Analytics:**
- Queries mais rápidas (sem JOIN)
- Distribuição do pipeline
- Taxa de conversão por estágio

**Sincronização automática:**
```sql
-- Trigger mantém stage sincronizado com stage_id
UPDATE deals SET stage_id = 'uuid-proposta';
-- Trigger atualiza automaticamente: stage = 'proposal'
```

---

## 🔄 Migração de Dados

A migration faz **migração automática** dos dados existentes:

### 1. Probabilidade
```sql
-- Todos os deals recebem 50% por padrão
UPDATE deals SET probability = 50 WHERE probability IS NULL;
```

### 2. User ID
```sql
-- Copia de assigned_to
UPDATE deals SET user_id = assigned_to WHERE user_id IS NULL;

-- Fallback: copia de contacts.created_by
UPDATE deals 
SET user_id = (SELECT created_by FROM contacts WHERE contacts.id = deals.contact_id)
WHERE user_id IS NULL;
```

### 3. Stage
```sql
-- Mapeia nomes dos stages atuais para valores padronizados
UPDATE deals SET stage = 
  CASE 
    WHEN stage_name = 'Sem Contato' THEN 'lead'
    WHEN stage_name = 'Prospecção' THEN 'qualified'
    WHEN stage_name = 'Conexão' THEN 'negotiation'
    WHEN stage_name = 'Fechado/Ganho' THEN 'won'
    WHEN stage_name = 'Perdido' THEN 'lost'
  END;
```

---

## 🚀 Como Aplicar a Migration

### Opção 1: Supabase CLI (Recomendado)

```bash
# 1. Conectar ao projeto
supabase link --project-ref seu-projeto

# 2. Aplicar migration
supabase db push

# 3. Verificar
supabase db diff
```

### Opção 2: Supabase Dashboard

1. Acesse: **Database** → **SQL Editor**
2. Cole o conteúdo de `20241128_add_analytics_fields.sql`
3. Execute (Run)
4. Verifique: **Database** → **Tables** → `deals`

### Opção 3: Ambiente Local (Dev)

```bash
# 1. Iniciar Supabase local
supabase start

# 2. Aplicar migration
supabase db push

# 3. Verificar
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\d deals"
```

---

## 🔍 Verificação Pós-Migration

### 1. Verificar estrutura da tabela

```sql
-- Ver colunas adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'deals' 
  AND column_name IN ('probability', 'user_id', 'stage');
```

**Resultado esperado:**
```
 column_name | data_type | is_nullable | column_default 
-------------+-----------+-------------+----------------
 probability | integer   | YES         | 50
 user_id     | uuid      | YES         | NULL
 stage       | text      | YES         | NULL
```

### 2. Verificar índices criados

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'deals'
  AND indexname LIKE '%probability%' 
   OR indexname LIKE '%user_id%'
   OR indexname LIKE '%stage_text%';
```

### 3. Verificar trigger

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_deal_stage';
```

### 4. Testar dados migrados

```sql
-- Ver distribuição de probabilidades
SELECT 
  probability,
  COUNT(*) as total_deals,
  SUM(value) as total_value
FROM deals
GROUP BY probability
ORDER BY probability DESC;

-- Ver deals sem user_id (deve ser 0)
SELECT COUNT(*) 
FROM deals 
WHERE user_id IS NULL;

-- Ver distribuição por stage
SELECT 
  stage,
  COUNT(*) as total,
  ROUND(AVG(value), 2) as avg_value
FROM deals
WHERE status = 'active'
GROUP BY stage
ORDER BY total DESC;
```

---

## ⚠️ Impactos e Considerações

### Compatibilidade
- ✅ **Retrocompatível**: Não quebra código existente
- ✅ **NULL values permitidos**: Campos podem ser NULL
- ✅ **Defaults sensatos**: 50% probability, stage inferido

### Performance
- ✅ **Índices criados**: Queries serão rápidas
- ✅ **Trigger leve**: Sincronização automática sem overhead
- ⚠️ **Volume de dados**: Migration pode demorar em bancos grandes (>10k deals)

### Dados Existentes
- ✅ **Migração automática**: Dados existentes são preenchidos
- ⚠️ **Revisar probability**: Ajustar manualmente se necessário
- ⚠️ **Revisar user_id**: Confirmar se mapeamento está correto

---

## 🔮 Funcionalidades Futuras (Opcional)

A migration inclui **código comentado** para funcionalidades opcionais:

### 1. Origem de Leads (`contacts.source`)

**Uso:** Análise de origem de leads (US-031 item 6)

```sql
-- Descomentar para habilitar
ALTER TABLE contacts ADD COLUMN source TEXT;
CREATE INDEX idx_contacts_source ON contacts(source);
```

**Valores sugeridos:**
- `website` - Site institucional
- `social-media` - Redes sociais
- `referral` - Indicação
- `email-campaign` - Campanha de email
- `cold-call` - Ligação fria
- `event` - Evento/feira

### 2. Tabela de Metas (`goals`)

**Uso:** Progresso de metas (US-031 item 7)

```sql
-- Descomentar para habilitar
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  target_value DECIMAL(10, 2),
  period TEXT CHECK (period IN ('monthly', 'quarterly', 'yearly')),
  start_date DATE,
  end_date DATE
);
```

---

## 📊 Exemplo de Uso no Analytics

### Receita Esperada

```sql
SELECT 
  DATE_TRUNC('month', expected_close_date) as month,
  SUM(value * (probability / 100.0)) as expected_revenue
FROM deals
WHERE stage IN ('qualified', 'proposal', 'negotiation')
  AND user_id = 'user-uuid'
  AND expected_close_date BETWEEN '2024-12-01' AND '2025-02-28'
GROUP BY month
ORDER BY month;
```

### Performance por Vendedor

```sql
SELECT 
  u.full_name,
  COUNT(*) FILTER (WHERE d.status = 'won') as deals_won,
  COUNT(*) as total_deals,
  ROUND(
    COUNT(*) FILTER (WHERE d.status = 'won')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as win_rate,
  SUM(d.value) FILTER (WHERE d.status = 'won') as revenue
FROM deals d
JOIN user_profiles u ON u.id = d.user_id
WHERE d.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.full_name
ORDER BY revenue DESC;
```

### Forecast 3 Meses

```sql
SELECT 
  DATE_TRUNC('month', expected_close_date) as month,
  ROUND(SUM(value * (probability / 100.0)) * 0.5) as pessimistic,
  ROUND(SUM(value * (probability / 100.0))) as realistic,
  ROUND(SUM(value * (probability / 100.0)) * 1.5) as optimistic
FROM deals
WHERE stage IN ('qualified', 'proposal', 'negotiation')
  AND expected_close_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
GROUP BY month
ORDER BY month;
```

---

## ✅ Checklist de Implementação

- [ ] Aplicar migration no ambiente de **desenvolvimento**
- [ ] Verificar dados migrados (queries de verificação)
- [ ] Testar APIs de analytics (`/api/analytics/*`)
- [ ] Testar dashboard (`/dashboard/analytics`)
- [ ] Ajustar probabilidades manualmente (se necessário)
- [ ] Aplicar migration em **staging**
- [ ] Validar em staging com dados reais
- [ ] **Backup do banco** antes de aplicar em produção
- [ ] Aplicar migration em **produção**
- [ ] Monitorar logs e performance

---

## 🆘 Troubleshooting

### Problema: Migration falha com "user_id cannot be NULL"

**Causa:** Deals sem `assigned_to` e sem `created_by` no contato

**Solução:**
```sql
-- Atribuir a um usuário admin padrão
UPDATE deals 
SET user_id = (SELECT id FROM auth.users WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;
```

### Problema: Stage fica NULL após migration

**Causa:** Nome do stage não foi mapeado corretamente

**Solução:**
```sql
-- Ver stages não mapeados
SELECT DISTINCT ds.name
FROM deals d
JOIN deal_stages ds ON ds.id = d.stage_id
WHERE d.stage IS NULL;

-- Mapear manualmente
UPDATE deals SET stage = 'qualified'
WHERE stage_id IN (SELECT id FROM deal_stages WHERE name = 'Nome Custom');
```

### Problema: Trigger não dispara

**Causa:** Trigger não foi criado ou foi removido

**Solução:**
```sql
-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_sync_deal_stage ON deals;
CREATE TRIGGER trigger_sync_deal_stage
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION sync_deal_stage();
```

---

**✅ Migration pronta para uso!**

Após aplicar esta migration, o módulo de Analytics Avançado estará **100% funcional** com todos os dados necessários no banco de dados.
