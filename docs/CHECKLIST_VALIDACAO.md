# ✅ Checklist: Validar Frontend com Dados de Teste

## 🎯 Objetivo

Executar o script de dados de teste e validar visualmente todas as funcionalidades do dashboard.

---

## 📋 Passo a Passo

### 1. Preparar Ambiente

- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Supabase Dashboard aberto
- [ ] Navegador pronto em http://localhost:3000

### 2. Executar Script de Dados

- [ ] Acessar [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [ ] Abrir arquivo `supabase/seed-test-data.sql`
- [ ] Copiar todo o conteúdo
- [ ] Colar no SQL Editor
- [ ] Clicar em **"Run"**
- [ ] Aguardar mensagem de sucesso

### 3. Verificar Dados Inseridos (SQL)

Execute no SQL Editor:

```sql
-- Verificar contagens
SELECT 'Contatos' as tabela, COUNT(*) as total FROM contacts
UNION ALL
SELECT 'Conversas', COUNT(*) FROM conversations
UNION ALL
SELECT 'Deals', COUNT(*) FROM deals;

-- Verificar valores
SELECT
  status,
  COUNT(*) as quantidade,
  'R$ ' || TO_CHAR(SUM(value), 'FM999,999,999.00') as valor_total
FROM deals
GROUP BY status;
```

**Resultado esperado:**

- Contatos: 15
- Conversas: 10+
- Deals: 40+
- Won: 33 vendas, ~R$ 2.295.000
- Open: 4+ negócios, ~R$ 1.570.000
- Lost: 3 negócios, ~R$ 205.000

### 4. Validar Dashboard (Visual)

#### 4.1 KPI Cards

- [ ] **Total de Contatos**: Mostra ~15
- [ ] **Conversas Ativas**: Mostra 6-8
- [ ] **Taxa de Conversão**: Mostra 25-30%
- [ ] **Novos Contatos**: Mostra 10-12
- [ ] **Total de Vendas**: Mostra R$ 2,3 mi (formatado)

#### 4.2 Trends (Setas e Percentuais)

- [ ] Cada KPI mostra seta (↑ verde ou ↓ vermelho)
- [ ] Percentual de mudança exibido
- [ ] Cores corretas (verde para positivo, vermelho para negativo)

#### 4.3 Gráfico de Vendas

- [ ] Gráfico renderiza sem erros
- [ ] Linha azul (primary) visível
- [ ] Pontos (dots) visíveis nos dados
- [ ] Eixo X com datas formatadas (dd/MM)
- [ ] Eixo Y com valores R$ formatados

#### 4.4 Filtros de Período

- [ ] Botões: **7 dias**, **30 dias**, **90 dias**
- [ ] Botão ativo destacado (variante default)
- [ ] Clicar em "7 dias": gráfico atualiza
- [ ] Clicar em "30 dias": gráfico atualiza
- [ ] Clicar em "90 dias": gráfico atualiza (30+ vendas)

#### 4.5 Filtros de Granularidade

- [ ] Botões: **Diário**, **Semanal**, **Mensal**
- [ ] Botão ativo destacado
- [ ] **Diário**: mostra vendas dia a dia
- [ ] **Semanal**: agrupa por semana
- [ ] **Mensal**: agrupa por mês

#### 4.6 Tooltip Interativo

- [ ] Ao passar mouse sobre o gráfico: tooltip aparece
- [ ] Tooltip mostra:
  - Data formatada (dd de mmmm de yyyy)
  - Valor em R$ formatado
  - Quantidade de vendas ("X vendas")
- [ ] Tooltip segue o mouse
- [ ] Estilo: fundo claro, borda, sombra

#### 4.7 Estados Especiais

- [ ] Loading state: animação "Carregando dados..." (testar com slow 3G)
- [ ] Empty state: (opcional) remover deals e verificar mensagem

### 5. Testar Responsividade

- [ ] Desktop (1920x1080): layout 4 colunas nos KPIs
- [ ] Tablet (768px): layout ajusta
- [ ] Mobile (375px): KPIs empilham, gráfico responsivo

### 6. Testar Performance

- [ ] Dashboard carrega em < 2 segundos
- [ ] Troca de filtros é instantânea
- [ ] Gráfico renderiza suavemente
- [ ] Sem console errors no DevTools

### 7. Testar Dark Mode

- [ ] Toggle tema para dark
- [ ] KPI Cards com fundo escuro
- [ ] Gráfico com cores adaptadas
- [ ] Tooltip legível em dark mode

---

## 🐛 Troubleshooting

### Dados não aparecem?

```sql
-- Verificar se há dados
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM deals WHERE status = 'won';

-- Verificar closed_at
SELECT * FROM deals WHERE status = 'won' LIMIT 5;
```

### Gráfico vazio?

```sql
-- Adicionar closed_at se necessário
UPDATE deals
SET closed_at = created_at + INTERVAL '1 day'
WHERE status = 'won' AND closed_at IS NULL;
```

### Erros 403/401?

- Verificar RLS policies no Supabase
- Verificar se usuário está autenticado
- Verificar .env.local com credenciais corretas

### Console Errors?

- Abrir DevTools (F12)
- Aba Console: verificar erros
- Aba Network: verificar requests 200 OK

---

## ✅ Validação Final

Marque apenas quando TUDO estiver funcionando:

- [ ] ✅ Todos os KPIs mostram dados
- [ ] ✅ Gráfico renderiza com 30+ vendas (90 dias)
- [ ] ✅ Filtros funcionam perfeitamente
- [ ] ✅ Tooltip interativo OK
- [ ] ✅ Responsivo em todos os tamanhos
- [ ] ✅ Dark mode funcional
- [ ] ✅ Zero errors no console
- [ ] ✅ Performance < 2s

---

## 📸 Screenshots (Opcional)

Tire prints para documentação:

1. Dashboard completo (visão geral)
2. KPIs com trends
3. Gráfico com tooltip visível
4. Filtros ativos (cada um)
5. Dark mode
6. Mobile view

Salve em: `docs/screenshots/`

---

## 🎉 Próximos Passos

Após validação completa:

- [ ] Fazer demo para stakeholders
- [ ] Preparar apresentação Sprint Review
- [ ] Iniciar US-017: Listar Contatos
- [ ] Documentar bugs encontrados (se houver)

---

**Data da validação:** ******\_******  
**Validado por:** ******\_******  
**Status:** [ ] Aprovado [ ] Ajustes necessários
