# Dados de Teste - CRM Simplificado

## 📋 Visão Geral

Este documento descreve os dados de teste disponíveis para validar o frontend e a persistência do sistema.

## 🎯 Objetivo

Fornecer um conjunto realista de dados de teste que permita:

- ✅ Validar visualmente todos os componentes do Dashboard
- ✅ Testar o gráfico de vendas com dados históricos
- ✅ Verificar KPIs e métricas calculadas
- ✅ Simular cenários reais de uso do CRM

## 📦 Dados Incluídos

### 👥 Contatos (15 registros)

**Contatos Ativos (7):**

- João Silva - TechCorp Brasil (Diretor de TI)
- Maria Santos - InnovaTech Solutions (CEO)
- Pedro Oliveira - Startup Innovations (CTO)
- Ana Costa - Big Retail Nacional (Gerente de Compras)
- Carlos Mendes - FinTech Brasil (CFO)
- Lucas Barbosa - Software House MG (Tech Lead)
- Camila Rocha - E-commerce Brasil (Diretora Digital)
- Patricia Dias - Healthcare Tech (Gerente de Inovação)

**Leads (3):**

- Fernanda Alves - New Startup Tech (Fundadora)
- Ricardo Souza - Enterprise Solutions SA (VP de Tecnologia)
- Beatriz Cardoso - Consulting Partners (Sócia)
- Felipe Martins - Digital Agency (Diretor Criativo)

**Inativos (3):**

- Juliana Ferreira - Old Company LTDA
- Roberto Lima - Traditional Business
- Gabriel Torres - Logistics Pro

### 💬 Conversas (10+ registros)

Conversas vinculadas aos contatos ativos e leads, incluindo:

- ✅ Diferentes status: open, closed
- ✅ Diferentes prioridades: high, medium, low
- ✅ Assuntos variados (propostas, dúvidas, follow-ups, etc.)
- ✅ Timestamps realistas

### 💰 Negócios/Deals (40+ registros)

**Deals Principais (10):**

- 3 Ganhos (won): Maria Santos (R$ 85k), Lucas Barbosa (R$ 65k), Pedro Oliveira (R$ 45k)
- 3 Perdidos (lost): Juliana Ferreira, Roberto Lima, Gabriel Torres
- 4 Em aberto (open): João Silva (R$ 150k), Ana Costa (R$ 320k), Carlos Mendes (R$ 180k), etc.

**Deals Históricos (30):**

- 30 vendas distribuídas nos últimos 90 dias
- Valores entre R$ 20k e R$ 120k
- Status: won (para popular o gráfico)

### 💵 Valores Financeiros

**Em Negociação:**

- Ana Costa: R$ 320.000,00 (Big Retail)
- Ricardo Souza: R$ 420.000,00 (Enterprise)
- Carlos Mendes: R$ 180.000,00 (FinTech)
- João Silva: R$ 150.000,00 (TechCorp)
- Outros: ~R$ 500.000,00
- **Total: ~R$ 1.570.000,00**

**Vendas Ganhas:**

- Maria Santos: R$ 85.000,00
- Lucas Barbosa: R$ 65.000,00
- Pedro Oliveira: R$ 45.000,00
- Histórico (30 deals): ~R$ 2.100.000,00
- **Total: ~R$ 2.295.000,00**

## 🚀 Como Usar

### 1. Executar o Script no Supabase

```bash
# Opção 1: Via SQL Editor no Dashboard do Supabase
1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql
2. Cole o conteúdo de `supabase/seed-test-data.sql`
3. Clique em "Run"

# Opção 2: Via CLI do Supabase (se disponível)
supabase db reset --db-url "postgresql://..."
```

### 2. Verificar Dados Inseridos

O script já inclui queries de verificação no final:

```sql
-- Contagem por tabela
SELECT 'Contatos criados:', COUNT(*) FROM contacts;
SELECT 'Conversas criadas:', COUNT(*) FROM conversations;
SELECT 'Deals criados:', COUNT(*) FROM deals;

-- Resumo financeiro
SELECT 'Valor total em negociação', SUM(value) FROM deals WHERE status = 'open';
SELECT 'Valor total ganho', SUM(value) FROM deals WHERE status = 'won';
```

### 3. Acessar o Dashboard

Após executar o script:

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Acessar
http://localhost:3000/dashboard
```

## 📊 Dados Esperados no Dashboard

### KPI Cards

1. **Total de Contatos**: ~15
2. **Conversas Ativas**: ~6-8 (status = 'open')
3. **Taxa de Conversão**: ~25-30%
4. **Novos Contatos (30d)**: ~10-12
5. **Total de Vendas**: R$ 2.295.000,00 (aproximado)

### Gráfico de Vendas

- **7 dias**: 2-4 vendas recentes
- **30 dias**: 8-12 vendas
- **90 dias**: 30+ vendas distribuídas

**Períodos de visualização:**

- Diário: barras individuais por dia
- Semanal: agregação por semana
- Mensal: agregação por mês

## 🔄 Limpar Dados de Teste

Se precisar resetar os dados:

```sql
-- ⚠️ CUIDADO: Isto apaga TODOS os dados!
TRUNCATE TABLE deals CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE contacts CASCADE;
```

## 📝 Notas Importantes

### Timestamps Realistas

- Contatos criados entre 1-60 dias atrás
- Deals distribuídos nos últimos 90 dias
- Conversas com last_message_at recente

### Status Variados

- **Contatos**: active, inactive, lead
- **Conversas**: open, closed
- **Deals**: open, won, lost
- **Stages**: discovery, qualification, proposal, negotiation, closed_won, closed_lost

### Dados Consistentes

- Cada deal está vinculado a um contato válido
- Conversas apenas para contatos ativos/leads
- Dates/timestamps em ordem cronológica lógica

## 🧪 Cenários de Teste

### 1. Dashboard Completo

✅ Todos os KPIs populados  
✅ Gráfico com dados históricos  
✅ Trends calculadas corretamente

### 2. Filtros de Período

✅ Alternar entre 7d/30d/90d  
✅ Gráfico atualiza com dados corretos  
✅ Loading states funcionando

### 3. Granularidade

✅ Diário: visualizar vendas por dia  
✅ Semanal: agregação semanal  
✅ Mensal: agregação mensal

### 4. Estados Vazios

- Remover temporariamente deals para testar empty state
- Verificar mensagem "Nenhuma venda encontrada"

## 📈 Métricas Esperadas

Com os dados de teste, você deve ver aproximadamente:

| Métrica              | Valor Esperado |
| -------------------- | -------------- |
| Total Contatos       | 15             |
| Conversas Ativas     | 6-8            |
| Taxa Conversão       | 25-30%         |
| Novos Contatos (30d) | 10-12          |
| Vendas Ganhas        | 33             |
| Valor em Negociação  | R$ 1.570.000   |
| Valor Total Ganho    | R$ 2.295.000   |

## 🐛 Troubleshooting

### Dados não aparecem no dashboard?

1. **Verificar autenticação**: Usuário logado?
2. **Verificar RLS**: Policies do Supabase configuradas?
3. **Console do navegador**: Erros de API?
4. **Network tab**: Requests retornando 200?

### Gráfico vazio?

```sql
-- Verificar se há deals com closed_at
SELECT COUNT(*), status FROM deals
WHERE closed_at IS NOT NULL
GROUP BY status;

-- Se não houver, adicionar manualmente:
UPDATE deals
SET closed_at = created_at + INTERVAL '1 day'
WHERE status = 'won' AND closed_at IS NULL;
```

### KPIs com valores estranhos?

```sql
-- Verificar cálculos manualmente
SELECT
  COUNT(*) as total_contatos,
  COUNT(*) FILTER (WHERE status = 'active') as ativos,
  COUNT(*) FILTER (WHERE status = 'lead') as leads,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as novos_30d
FROM contacts;
```

## 📚 Próximos Passos

Após validar com dados de teste:

1. ✅ Implementar US-017: Listar Contatos
2. ✅ Implementar US-018: Criar Contato
3. ✅ Implementar US-019: Editar Contato
4. ✅ Adicionar mais funcionalidades ao Dashboard

## 🎉 Conclusão

Este conjunto de dados de teste fornece uma base sólida para:

- Desenvolvimento e validação de features
- Demonstrações para stakeholders
- Testes manuais de UI/UX
- Screenshots e documentação

Execute o script e aproveite para testar todas as funcionalidades implementadas! 🚀
