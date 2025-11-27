# 🎯 Como Executar o Script de Dados de Teste em Produção

## 📋 Pré-requisitos

✅ Acesso ao Dashboard do Supabase  
✅ Projeto já criado com as migrations aplicadas  
✅ RLS (Row Level Security) configurado

**⚠️ IMPORTANTE**: O script irá criar automaticamente:

1. **Constraints únicas**:
   - `contacts.email` - Email único para cada contato
   - `conversations(contact_id, channel_id)` - Uma conversa por contato+canal

2. **Coluna closed_at**:
   - Adiciona `deals.closed_at` (TIMESTAMP) para registrar quando deal foi fechado
   - Cria índice para melhor performance
   - Necessária para o gráfico de vendas funcionar corretamente

Essas modificações são necessárias para o script funcionar corretamente e são **seguras** (não afetam dados existentes).

## 🚀 Passo a Passo

### 1️⃣ Acessar o SQL Editor

1. Entre no dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: **crm-simplificado**
3. No menu lateral, clique em **SQL Editor**

### 2️⃣ Criar Nova Query

1. Clique em **"+ New query"** no canto superior direito
2. Dê um nome para a query: `Seed - Dados de Teste`

### 3️⃣ Copiar e Colar o Script

1. Abra o arquivo: `supabase/seed-production.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase

### 4️⃣ Executar o Script

1. Clique no botão **"Run"** (ou pressione `Ctrl + Enter`)
2. Aguarde a execução (pode levar 5-10 segundos)
3. Verifique os resultados no painel inferior

## ✅ Resultado Esperado

Você deverá ver 2 tabelas de resultado:

### Tabela 1: Contagem de Registros
```
┌────────────────────┬───────┐
│ tabela             │ total │
├────────────────────┼───────┤
│ Contatos criados:  │ 15    │
│ Conversas criadas: │ 8     │
│ Deals criados:     │ 45    │
│ Deals ganhos:      │ 33    │
│ Deals perdidos:    │ 3     │
│ Deals ativos:      │ 9     │
└────────────────────┴───────┘
```

### Tabela 2: Resumo Financeiro
```
┌───────────────────────────┬──────────────────┐
│ metrica                   │ valor            │
├───────────────────────────┼──────────────────┤
│ Valor total em negociação │ R$ ~1.600.000,00 │
│ Valor total ganho         │ R$ ~2.100.000,00 │
│ Valor total perdido       │ R$ 180.000,00    │
└───────────────────────────┴──────────────────┘
```

## 🎨 Validar no Dashboard

Após executar o script, acesse seu dashboard:

👉 **http://localhost:3000/dashboard** (ou seu domínio de produção)

### Você deve ver:

✅ **KPI Total de Contatos**: 15  
✅ **KPI Conversas Ativas**: ~8  
✅ **KPI Taxa de Conversão**: ~73%  
✅ **KPI Novos Contatos**: depende do período  
✅ **KPI Total de Vendas**: R$ 2,1M  
✅ **Gráfico de Vendas**: 33 pontos distribuídos nos últimos 90 dias

## 🔧 Troubleshooting

### ❌ Erro: "column closed_at does not exist"

**Causa**: A coluna `closed_at` não existe na tabela `deals` (versão antiga do script).

**Solução**: 
- Use a **versão mais recente** do script `seed-production.sql`
- Ou execute manualmente ANTES do seed:
  ```sql
  ALTER TABLE deals ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;
  CREATE INDEX idx_deals_closed_at ON deals(closed_at) WHERE closed_at IS NOT NULL;
  ```

### ❌ Erro: "duplicate key value violates unique constraint"

**Causa**: Você já executou o script antes e está tentando inserir os mesmos emails.

**Solução**: 
- Opção 1: Limpar os dados antes (veja seção "Limpar Dados")
- Opção 2: Ignorar o erro (o script usa `ON CONFLICT DO NOTHING`)

### ❌ Erro: "no unique or exclusion constraint matching the ON CONFLICT"

**Causa**: As constraints únicas não foram criadas (versão antiga do script).

**Solução**: 
- Use a **versão mais recente** do script `seed-production.sql`
- Ou execute manualmente ANTES do seed:
  ```sql
  ALTER TABLE contacts ADD CONSTRAINT contacts_email_unique UNIQUE (email);
  ALTER TABLE conversations ADD CONSTRAINT conversations_contact_channel_unique UNIQUE (contact_id, channel_id);
  ```

### ❌ Erro: "relation does not exist"

**Causa**: As migrations não foram aplicadas.

**Solução**: 
1. Vá para **Database > Migrations**
2. Execute todas as migrations pendentes
3. Tente executar o script novamente

### ❌ Erro: "permission denied for table"

**Causa**: Problemas com RLS ou permissões.

**Solução**:
1. Vá para **Authentication > Policies**
2. Verifique se as tabelas têm políticas de INSERT habilitadas
3. Se necessário, desabilite temporariamente o RLS para teste

## 🗑️ Limpar Dados (Opcional)

Se você quiser **remover todos os dados de teste**:

```sql
-- ATENÇÃO: Isso apagará TODOS os dados!
BEGIN;

TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE deals CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE channels CASCADE;
TRUNCATE TABLE deal_stages CASCADE;
TRUNCATE TABLE contacts CASCADE;

COMMIT;
```

⚠️ **CUIDADO**: Só execute isso se tiver certeza que quer apagar tudo!

## 📊 Verificar Dados Inseridos

Execute esta query para ver o que foi inserido:

```sql
-- Ver todos os contatos
SELECT name, email, 
       custom_fields->>'company' as company,
       custom_fields->>'position' as position
FROM contacts
ORDER BY created_at DESC;

-- Ver todos os deals
SELECT 
  c.name as contato,
  d.title,
  d.value,
  d.status,
  ds.name as stage
FROM deals d
JOIN contacts c ON d.contact_id = c.id
JOIN deal_stages ds ON d.stage_id = ds.id
ORDER BY d.created_at DESC;

-- Ver vendas por mês (para o gráfico)
SELECT 
  DATE_TRUNC('day', closed_at) as data,
  COUNT(*) as quantidade,
  SUM(value) as valor_total
FROM deals
WHERE status = 'won' AND closed_at IS NOT NULL
GROUP BY DATE_TRUNC('day', closed_at)
ORDER BY data DESC
LIMIT 30;
```

## 📝 Notas Importantes

1. **Transação**: O script usa `BEGIN/COMMIT` para garantir atomicidade
2. **Idempotência**: Usa `ON CONFLICT DO NOTHING` para evitar duplicatas
3. **UUIDs Fixos**: Channels e deal_stages usam UUIDs fixos para referências
4. **Datas Relativas**: Usa `NOW()` e intervalos para datas dinâmicas
5. **Dados Realísticos**: Nomes, empresas e valores são fictícios mas realistas

## 🎉 Próximos Passos

Após popular os dados:

1. ✅ Validar dashboard funcionando
2. ✅ Testar filtros de período (7d, 30d, 90d)
3. ✅ Verificar gráfico de vendas
4. ✅ Testar responsividade
5. ✅ Continuar Sprint 2: US-017 Listar Contatos

---

💡 **Dica**: Salve esta query no SQL Editor para poder reexecutar facilmente no futuro!
