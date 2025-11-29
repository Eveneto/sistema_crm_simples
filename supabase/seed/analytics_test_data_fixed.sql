-- =====================================================
-- Dados de Teste para Analytics Avançado
-- Data: 2024-11-28
-- Descrição: Insere dados realistas para testar o módulo de Analytics
-- =====================================================

-- IMPORTANTE: Este script assume que você já tem:
-- 1. Um usuário autenticado (pegue o UUID de auth.users)
-- 2. Estágios criados na tabela deal_stages
-- 3. Migration 20241128_add_analytics_fields.sql aplicada

-- =====================================================
-- CONFIGURAÇÃO: Seu User ID
-- =====================================================
-- INSTRUÇÕES: Troque apenas o UUID abaixo pelo seu user_id
-- Para pegar seu user_id, execute: SELECT id, email FROM auth.users LIMIT 1;

DO $$
DECLARE
  v_user_id UUID := '2bb3b762-2e2b-4c12-a0d2-3d7818529f40'; -- ⬅️ SUBSTITUA AQUI
  v_stage_lead UUID;
  v_stage_qualified UUID;
  v_stage_proposal UUID;
  v_stage_won UUID;
  v_stage_lost UUID;
BEGIN

-- =====================================================
-- PASSO 1: Buscar IDs dos Estágios
-- =====================================================
SELECT id INTO v_stage_lead FROM deal_stages 
  WHERE name ILIKE '%sem contato%' OR name ILIKE '%lead%' LIMIT 1;
  
SELECT id INTO v_stage_qualified FROM deal_stages 
  WHERE name ILIKE '%prospec%' OR name ILIKE '%qualif%' LIMIT 1;
  
SELECT id INTO v_stage_proposal FROM deal_stages 
  WHERE name ILIKE '%proposta%' OR name ILIKE '%conex%' LIMIT 1;
  
SELECT id INTO v_stage_won FROM deal_stages 
  WHERE name ILIKE '%ganho%' OR name ILIKE '%fechado%' LIMIT 1;
  
SELECT id INTO v_stage_lost FROM deal_stages 
  WHERE name ILIKE '%perdido%' LIMIT 1;

-- =====================================================
-- PASSO 2: Criar Contatos de Teste
-- =====================================================
INSERT INTO contacts (id, name, phone, email, tags, created_by) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'João Silva', '11999991111', 'joao@empresa.com', ARRAY['vip', 'cliente'], v_user_id),
  ('c2222222-2222-2222-2222-222222222222', 'Maria Santos', '11999992222', 'maria@startup.com', ARRAY['lead'], v_user_id),
  ('c3333333-3333-3333-3333-333333333333', 'Pedro Oliveira', '11999993333', 'pedro@tech.com', ARRAY['cliente'], v_user_id),
  ('c4444444-4444-4444-4444-444444444444', 'Ana Costa', '11999994444', 'ana@digital.com', ARRAY['lead', 'quente'], v_user_id),
  ('c5555555-5555-5555-5555-555555555555', 'Carlos Lima', '11999995555', 'carlos@corp.com', ARRAY['vip'], v_user_id),
  ('c6666666-6666-6666-6666-666666666666', 'Beatriz Souza', '11999996666', 'beatriz@saas.com', ARRAY['cliente'], v_user_id),
  ('c7777777-7777-7777-7777-777777777777', 'Rafael Alves', '11999997777', 'rafael@dev.com', ARRAY['lead'], v_user_id),
  ('c8888888-8888-8888-8888-888888888888', 'Julia Ferreira', '11999998888', 'julia@agencia.com', ARRAY['cliente', 'vip'], v_user_id),
  ('c9999999-9999-9999-9999-999999999999', 'Lucas Mendes', '11999999999', 'lucas@ecommerce.com', ARRAY['lead'], v_user_id),
  ('ca000000-0000-0000-0000-000000000000', 'Fernanda Lima', '11988881111', 'fernanda@marketing.com', ARRAY['cliente'], v_user_id),
  ('cb000000-0000-0000-0000-000000000000', 'Ricardo Santos', '11988882222', 'ricardo@vendas.com', ARRAY['lead', 'quente'], v_user_id),
  ('cc000000-0000-0000-0000-000000000000', 'Patricia Costa', '11988883333', 'patricia@consultoria.com', ARRAY['vip'], v_user_id),
  ('cd000000-0000-0000-0000-000000000000', 'Marcos Silva', '11988884444', 'marcos@software.com', ARRAY['cliente'], v_user_id),
  ('ce000000-0000-0000-0000-000000000000', 'Camila Rocha', '11988885555', 'camila@design.com', ARRAY['lead'], v_user_id),
  ('cf000000-0000-0000-0000-000000000000', 'Bruno Dias', '11988886666', 'bruno@startup.com', ARRAY['cliente', 'vip'], v_user_id),
  ('c0000001-0000-0000-0000-000000000000', 'Amanda Lopes', '11988887777', 'amanda@tech.com', ARRAY['lead'], v_user_id),
  ('c0000002-0000-0000-0000-000000000000', 'Thiago Martins', '11988888888', 'thiago@digital.com', ARRAY['cliente'], v_user_id),
  ('c0000003-0000-0000-0000-000000000000', 'Larissa Cunha', '11988889999', 'larissa@saas.com', ARRAY['vip'], v_user_id),
  ('c0000004-0000-0000-0000-000000000000', 'Gabriel Souza', '11987771111', 'gabriel@corp.com', ARRAY['lead', 'quente'], v_user_id),
  ('c0000005-0000-0000-0000-000000000000', 'Isabela Nunes', '11987772222', 'isabela@agencia.com', ARRAY['cliente'], v_user_id)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE '✅ 20 contatos criados com sucesso!';

-- =====================================================
-- PASSO 3: Criar Deals GANHOS (Últimos 3 meses)
-- =====================================================
INSERT INTO deals (
  title, description, contact_id, stage_id, stage, 
  value, probability, expected_close_date, 
  user_id, assigned_to, status, 
  created_at, updated_at, closed_at
) VALUES
  -- Novembro 2024
  ('Projeto Site Institucional', 'Desenvolvimento de site + SEO', 'c1111111-1111-1111-1111-111111111111', v_stage_won, 'won', 
   15000, 100, '2024-11-15', v_user_id, v_user_id, 'won', 
   '2024-10-20', '2024-11-15', '2024-11-15'),
   
  ('Consultoria Marketing Digital', 'Consultoria mensal por 6 meses', 'c3333333-3333-3333-3333-333333333333', v_stage_won, 'won',
   42000, 100, '2024-11-10', v_user_id, v_user_id, 'won',
   '2024-10-15', '2024-11-10', '2024-11-10'),
   
  ('Sistema CRM Customizado', 'Desenvolvimento de CRM sob medida', 'c5555555-5555-5555-5555-555555555555', v_stage_won, 'won',
   85000, 100, '2024-11-25', v_user_id, v_user_id, 'won',
   '2024-09-10', '2024-11-25', '2024-11-25'),
   
  ('App Mobile iOS/Android', 'Desenvolvimento de aplicativo', 'c8888888-8888-8888-8888-888888888888', v_stage_won, 'won',
   120000, 100, '2024-11-20', v_user_id, v_user_id, 'won',
   '2024-08-15', '2024-11-20', '2024-11-20'),
   
  -- Outubro 2024
  ('Redesign UI/UX', 'Redesign completo de plataforma', 'ca000000-0000-0000-0000-000000000000', v_stage_won, 'won',
   28000, 100, '2024-10-18', v_user_id, v_user_id, 'won',
   '2024-09-01', '2024-10-18', '2024-10-18'),
   
  ('Automação de Marketing', 'Setup e automação HubSpot', 'cc000000-0000-0000-0000-000000000000', v_stage_won, 'won',
   18500, 100, '2024-10-12', v_user_id, v_user_id, 'won',
   '2024-09-20', '2024-10-12', '2024-10-12'),
   
  ('E-commerce Completo', 'Loja virtual + integração pagamento', 'cf000000-0000-0000-0000-000000000000', v_stage_won, 'won',
   65000, 100, '2024-10-25', v_user_id, v_user_id, 'won',
   '2024-08-10', '2024-10-25', '2024-10-25'),
   
  -- Setembro 2024
  ('Landing Page + Ads', 'LP para campanha + gestão Google Ads', 'c6666666-6666-6666-6666-666666666666', v_stage_won, 'won',
   12000, 100, '2024-09-15', v_user_id, v_user_id, 'won',
   '2024-08-25', '2024-09-15', '2024-09-15'),
   
  ('Dashboard Analytics', 'Dashboard customizado BI', 'cd000000-0000-0000-0000-000000000000', v_stage_won, 'won',
   32000, 100, '2024-09-22', v_user_id, v_user_id, 'won',
   '2024-07-10', '2024-09-22', '2024-09-22')
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ 9 deals ganhos criados (R$ 417.500)!';

-- =====================================================
-- PASSO 4: Criar Deals ATIVOS (Para Forecast)
-- =====================================================
INSERT INTO deals (
  title, description, contact_id, stage_id, stage,
  value, probability, expected_close_date,
  user_id, assigned_to, status,
  created_at, updated_at
) VALUES
  -- Alta probabilidade (80-90%)
  ('ERP Enterprise', 'Sistema ERP completo', 'c2222222-2222-2222-2222-222222222222', v_stage_proposal, 'negotiation',
   250000, 85, '2024-12-15', v_user_id, v_user_id, 'active',
   '2024-10-01', NOW()),
   
  ('Consultoria DevOps', 'Consultoria migração cloud', 'c4444444-4444-4444-4444-444444444444', v_stage_proposal, 'negotiation',
   45000, 80, '2024-12-20', v_user_id, v_user_id, 'active',
   '2024-10-15', NOW()),
   
  -- Média probabilidade (50-70%)
  ('Sistema Gestão Estoque', 'WMS customizado', 'c7777777-7777-7777-7777-777777777777', v_stage_qualified, 'qualified',
   78000, 60, '2025-01-10', v_user_id, v_user_id, 'active',
   '2024-11-01', NOW()),
   
  ('App Delivery', 'Aplicativo delivery comida', 'c9999999-9999-9999-9999-999999999999', v_stage_qualified, 'qualified',
   95000, 65, '2025-01-20', v_user_id, v_user_id, 'active',
   '2024-10-20', NOW()),
   
  ('Portal Corporativo', 'Intranet + gestão documentos', 'cb000000-0000-0000-0000-000000000000', v_stage_proposal, 'proposal',
   52000, 70, '2024-12-28', v_user_id, v_user_id, 'active',
   '2024-11-05', NOW()),
   
  -- Baixa probabilidade (30-40%)
  ('Site E-learning', 'Plataforma cursos online', 'ce000000-0000-0000-0000-000000000000', v_stage_qualified, 'qualified',
   38000, 40, '2025-02-15', v_user_id, v_user_id, 'active',
   '2024-11-10', NOW()),
   
  ('Integração APIs', 'Integração múltiplos sistemas', 'c0000001-0000-0000-0000-000000000000', v_stage_lead, 'lead',
   22000, 30, '2025-02-28', v_user_id, v_user_id, 'active',
   '2024-11-15', NOW()),
   
  ('App Fitness', 'Aplicativo treinos personalizados', 'c0000002-0000-0000-0000-000000000000', v_stage_qualified, 'qualified',
   48000, 50, '2025-01-25', v_user_id, v_user_id, 'active',
   '2024-11-08', NOW()),
   
  ('SaaS B2B', 'Plataforma SaaS multi-tenant', 'c0000003-0000-0000-0000-000000000000', v_stage_proposal, 'proposal',
   180000, 75, '2025-01-15', v_user_id, v_user_id, 'active',
   '2024-09-20', NOW()),
   
  ('Marketplace', 'Marketplace produtos artesanais', 'c0000004-0000-0000-0000-000000000000', v_stage_qualified, 'qualified',
   110000, 55, '2025-02-10', v_user_id, v_user_id, 'active',
   '2024-10-25', NOW())
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ 10 deals ativos criados (R$ 918.000 pipeline)!';

-- =====================================================
-- PASSO 5: Criar Deals PERDIDOS (Para Win Rate)
-- =====================================================
INSERT INTO deals (
  title, description, contact_id, stage_id, stage,
  value, probability, expected_close_date,
  user_id, assigned_to, status,
  created_at, updated_at, closed_at
) VALUES
  ('Projeto MVP', 'MVP para startup', 'c0000005-0000-0000-0000-000000000000', v_stage_lost, 'lost',
   35000, 0, '2024-11-10', v_user_id, v_user_id, 'lost',
   '2024-10-01', '2024-11-05', '2024-11-05'),
   
  ('Refatoração Legacy', 'Refatoração sistema legado', 'c1111111-1111-1111-1111-111111111111', v_stage_lost, 'lost',
   58000, 0, '2024-10-20', v_user_id, v_user_id, 'lost',
   '2024-09-10', '2024-10-18', '2024-10-18'),
   
  ('Consultoria SEO', 'Auditoria e consultoria SEO', 'c3333333-3333-3333-3333-333333333333', v_stage_lost, 'lost',
   8500, 0, '2024-09-30', v_user_id, v_user_id, 'lost',
   '2024-09-15', '2024-09-28', '2024-09-28')
ON CONFLICT DO NOTHING;

RAISE NOTICE '3 deals perdidos criados (R$ 101.500)!';
RAISE NOTICE 'RESUMO: Win Rate = 75 porcento | Ticket Medio = R$ 46.388 | Pipeline = R$ 918.000';

END $$;

-- =====================================================
-- PASSO 6: Verificar Dados Inseridos
-- =====================================================

-- Ver resumo dos deals criados
SELECT 
  status,
  stage,
  COUNT(*) as total_deals,
  SUM(value) as total_value,
  ROUND(AVG(probability), 2) as avg_probability
FROM deals
WHERE user_id = '2bb3b762-2e2b-4c12-a0d2-3d7818529f40' -- ⬅️ Troque aqui também
GROUP BY status, stage
ORDER BY status, stage;

-- Ver deals ganhos por mês (receita realizada)
SELECT 
  TO_CHAR(closed_at, 'YYYY-MM') as month,
  COUNT(*) as deals_won,
  TO_CHAR(SUM(value), 'L999G999G999') as revenue
FROM deals
WHERE user_id = '2bb3b762-2e2b-4c12-a0d2-3d7818529f40' -- ⬅️ Troque aqui também
  AND status = 'won'
GROUP BY month
ORDER BY month DESC;

-- Ver forecast (receita esperada)
SELECT 
  TO_CHAR(expected_close_date, 'YYYY-MM') as month,
  COUNT(*) as deals_in_pipeline,
  TO_CHAR(SUM(value), 'L999G999G999') as total_value,
  TO_CHAR(SUM(value * (probability / 100.0)), 'L999G999G999') as expected_revenue
FROM deals
WHERE user_id = '2bb3b762-2e2b-4c12-a0d2-3d7818529f40' -- ⬅️ Troque aqui também
  AND status = 'active'
  AND stage IN ('qualified', 'proposal', 'negotiation')
GROUP BY month
ORDER BY month;

-- =====================================================
-- ✅ PRONTO! Dados de Teste Criados com Sucesso!
-- =====================================================
-- 
-- Total criado:
-- • 20 contatos variados com tags
-- • 9 deals ganhos = R$ 417.500
-- • 10 deals ativos = R$ 918.000 (pipeline)
-- • 3 deals perdidos = R$ 101.500
--
-- Métricas esperadas:
-- • Win Rate: 75% (9 ganhos / 12 fechados)
-- • Ticket Médio: R$ 46.388
-- • Receita Esperada: ~R$ 590.000
--
-- Próximos passos:
-- 1. Acesse /dashboard/analytics
-- 2. Teste os filtros de período
-- 3. Verifique os gráficos e KPIs
-- 4. Teste as APIs: /api/analytics/*
--
-- =====================================================
