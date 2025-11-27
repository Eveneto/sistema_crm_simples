-- Script de dados de teste para o CRM
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- ATENÇÃO: Este script popula dados de teste
-- ============================================

-- Limpar dados existentes (descomente se necessário)
-- TRUNCATE TABLE activities CASCADE;
-- TRUNCATE TABLE deals CASCADE;
-- TRUNCATE TABLE conversations CASCADE;
-- TRUNCATE TABLE messages CASCADE;
-- TRUNCATE TABLE channels CASCADE;
-- TRUNCATE TABLE deal_stages CASCADE;
-- TRUNCATE TABLE contacts CASCADE;

-- ============================================
-- 1. CRIAR CANAL PADRÃO (necessário para conversations)
-- ============================================

INSERT INTO channels (id, type, name, phone, is_connected, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'whatsapp', 'WhatsApp Principal', '+5511999999999', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CRIAR STAGES DE NEGÓCIOS (necessário para deals)
-- ============================================

INSERT INTO deal_stages (id, name, color, position, created_at)
VALUES 
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Novo Lead', '#3b82f6', 0, NOW()),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'Qualificação', '#8b5cf6', 1, NOW()),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'Proposta', '#f59e0b', 2, NOW()),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'Negociação', '#10b981', 3, NOW()),
  ('10000000-0000-0000-0000-000000000005'::uuid, 'Ganho', '#22c55e', 4, NOW()),
  ('10000000-0000-0000-0000-000000000006'::uuid, 'Perdido', '#ef4444', 5, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. INSERIR CONTATOS
-- ============================================

INSERT INTO contacts (name, email, phone, tags, custom_fields, created_at, updated_at)
VALUES
  -- Contatos Ativos
  ('João Silva', 'joao.silva@techcorp.com.br', '(11) 98765-4321', 
   ARRAY['cliente', 'enterprise'], 
   '{"company": "TechCorp Brasil", "position": "Diretor de TI", "status": "active", "notes": "Cliente em potencial para solução enterprise. Demonstrou interesse em nossa plataforma de BI."}'::jsonb,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
  
  ('Maria Santos', 'maria.santos@innovatech.com', '(21) 99876-5432',
   ARRAY['cliente', 'ativo'],
   '{"company": "InnovaTech Solutions", "position": "CEO", "status": "active", "notes": "Empresa de médio porte focada em inovação. Bom fit para nossos produtos."}'::jsonb,
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
  
  ('Pedro Oliveira', 'pedro.oliveira@startup.io', '(11) 97654-3210',
   ARRAY['startup', 'tecnologia'],
   '{"company": "Startup Innovations", "position": "CTO", "status": "active", "notes": "Startup em crescimento rápido. Precisa de soluções escaláveis."}'::jsonb,
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
  
  ('Ana Costa', 'ana.costa@bigretail.com.br', '(85) 98543-2109',
   ARRAY['enterprise', 'varejo'],
   '{"company": "Big Retail Nacional", "position": "Gerente de Compras", "status": "active", "notes": "Grande varejista com 200+ lojas. Projeto de transformação digital."}'::jsonb,
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),
  
  ('Carlos Mendes', 'carlos.mendes@fintech.com', '(11) 99321-8765',
   ARRAY['fintech', 'prioritário'],
   '{"company": "FinTech Brasil", "position": "CFO", "status": "active", "notes": "Fintech em expansão. Interesse em nossa solução de analytics."}'::jsonb,
   NOW() - INTERVAL '12 days', NOW() - INTERVAL '6 hours'),
  
  -- Contatos Inativos
  ('Juliana Ferreira', 'juliana@oldcompany.com.br', '(41) 98234-5678',
   ARRAY['perdido'],
   '{"company": "Old Company LTDA", "position": "Diretora Comercial", "status": "inactive", "notes": "Perdeu interesse após demonstração. Orçamento limitado."}'::jsonb,
   NOW() - INTERVAL '45 days', NOW() - INTERVAL '40 days'),
  
  ('Roberto Lima', 'roberto.lima@traditional.com', '(48) 97123-4567',
   ARRAY['perdido'],
   '{"company": "Traditional Business", "position": "Gerente", "status": "inactive", "notes": "Empresa não está pronta para mudanças tecnológicas no momento."}'::jsonb,
   NOW() - INTERVAL '50 days', NOW() - INTERVAL '45 days'),
  
  -- Leads Novos
  ('Fernanda Alves', 'fernanda@newstartup.io', '(11) 96789-0123',
   ARRAY['lead', 'startup'],
   '{"company": "New Startup Tech", "position": "Fundadora", "status": "lead", "notes": "Contato inicial via LinkedIn. Agendar reunião de discovery."}'::jsonb,
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  ('Ricardo Souza', 'ricardo.souza@enterprise.com.br', '(21) 95678-9012',
   ARRAY['lead', 'enterprise'],
   '{"company": "Enterprise Solutions SA", "position": "VP de Tecnologia", "status": "lead", "notes": "Indicação de parceiro. Empresa com 500+ funcionários."}'::jsonb,
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  ('Beatriz Cardoso', 'beatriz@consulting.com', '(11) 94567-8901',
   ARRAY['lead', 'parceria'],
   '{"company": "Consulting Partners", "position": "Sócia", "status": "lead", "notes": "Participou do nosso webinar. Interesse em partnership."}'::jsonb,
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Mais contatos para volume
  ('Lucas Barbosa', 'lucas.b@software.com.br', '(31) 93456-7890',
   ARRAY['cliente', 'software'],
   '{"company": "Software House MG", "position": "Tech Lead", "status": "active", "notes": "Procura ferramentas para gestão de projetos internos."}'::jsonb,
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '4 days'),
  
  ('Camila Rocha', 'camila.rocha@ecommerce.com', '(11) 92345-6789',
   ARRAY['ecommerce', 'ativo'],
   '{"company": "E-commerce Brasil", "position": "Diretora Digital", "status": "active", "notes": "Necessita integração com múltiplas plataformas."}'::jsonb,
   NOW() - INTERVAL '22 days', NOW() - INTERVAL '7 days'),
  
  ('Felipe Martins', 'felipe@agency.com.br', '(21) 91234-5678',
   ARRAY['lead', 'agência'],
   '{"company": "Digital Agency", "position": "Diretor Criativo", "status": "lead", "notes": "Agência buscando ferramenta de gestão de clientes."}'::jsonb,
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  
  ('Patricia Dias', 'patricia.dias@healthcare.com.br', '(11) 90123-4567',
   ARRAY['healthcare', 'compliance'],
   '{"company": "Healthcare Tech", "position": "Gerente de Inovação", "status": "active", "notes": "Setor de saúde, precisa compliance LGPD."}'::jsonb,
   NOW() - INTERVAL '28 days', NOW() - INTERVAL '8 days'),
  
  ('Gabriel Torres', 'gabriel@logistics.com.br', '(19) 89012-3456',
   ARRAY['perdido', 'logística'],
   '{"company": "Logistics Pro", "position": "Coordenador TI", "status": "inactive", "notes": "Escolheu concorrente por questão de preço."}'::jsonb,
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. INSERIR CONVERSAS
-- ============================================

-- Nota: conversations requer channel_id. Usando o canal criado acima.
INSERT INTO conversations (contact_id, channel_id, status, last_message_at, unread_count, created_at, updated_at)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000001'::uuid, -- Canal WhatsApp criado acima
  CASE 
    WHEN c.tags && ARRAY['cliente', 'ativo', 'prioritário'] THEN 'open'
    WHEN c.tags && ARRAY['lead'] THEN 'open'
    ELSE 'closed'
  END,
  NOW() - (random() * INTERVAL '2 days'),
  CASE 
    WHEN c.tags && ARRAY['prioritário'] THEN floor(random() * 5 + 1)::int
    ELSE floor(random() * 3)::int
  END,
  c.created_at + INTERVAL '1 day',
  NOW() - (random() * INTERVAL '1 day')
FROM contacts c
WHERE c.tags && ARRAY['cliente', 'lead', 'ativo']
ON CONFLICT (contact_id, channel_id) DO NOTHING;

-- ============================================
-- 5. INSERIR NEGÓCIOS/DEALS
-- ============================================

INSERT INTO deals (contact_id, title, value, stage_id, status, expected_close_date, closed_at, position, created_at, updated_at)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'João Silva' THEN 'Licença Enterprise - TechCorp'
    WHEN c.name = 'Maria Santos' THEN 'Plano Professional - InnovaTech'
    WHEN c.name = 'Pedro Oliveira' THEN 'Startup Plan + Consultoria'
    WHEN c.name = 'Ana Costa' THEN 'Solução Omnichannel - Big Retail'
    WHEN c.name = 'Carlos Mendes' THEN 'Analytics Platform - FinTech'
    WHEN c.name = 'Lucas Barbosa' THEN 'Gestão de Projetos - Software House'
    WHEN c.name = 'Camila Rocha' THEN 'Integração E-commerce'
    WHEN c.name = 'Patricia Dias' THEN 'Healthcare CRM + LGPD'
    WHEN c.name = 'Fernanda Alves' THEN 'Startup Package'
    WHEN c.name = 'Ricardo Souza' THEN 'Enterprise 500+ usuários'
    WHEN c.name = 'Juliana Ferreira' THEN 'Plano Professional'
    WHEN c.name = 'Roberto Lima' THEN 'Solução Básica'
    ELSE 'Negócio Padrão'
  END,
  CASE 
    WHEN c.name = 'João Silva' THEN 150000.00
    WHEN c.name = 'Maria Santos' THEN 85000.00
    WHEN c.name = 'Pedro Oliveira' THEN 45000.00
    WHEN c.name = 'Ana Costa' THEN 320000.00
    WHEN c.name = 'Carlos Mendes' THEN 180000.00
    WHEN c.name = 'Lucas Barbosa' THEN 65000.00
    WHEN c.name = 'Camila Rocha' THEN 95000.00
    WHEN c.name = 'Patricia Dias' THEN 125000.00
    WHEN c.name = 'Fernanda Alves' THEN 35000.00
    WHEN c.name = 'Ricardo Souza' THEN 420000.00
    WHEN c.name = 'Juliana Ferreira' THEN 75000.00
    WHEN c.name = 'Roberto Lima' THEN 55000.00
    ELSE 50000.00
  END,
  CASE 
    -- Ganhos vão para stage "Ganho"
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Pedro Oliveira') THEN '10000000-0000-0000-0000-000000000005'::uuid
    -- Perdidos vão para stage "Perdido"
    WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima', 'Gabriel Torres') THEN '10000000-0000-0000-0000-000000000006'::uuid
    -- Em proposta
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN '10000000-0000-0000-0000-000000000003'::uuid
    -- Em qualificação
    WHEN c.name = 'João Silva' THEN '10000000-0000-0000-0000-000000000002'::uuid
    -- Novos leads
    ELSE '10000000-0000-0000-0000-000000000001'::uuid
  END,
  CASE 
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Pedro Oliveira') THEN 'won'
    WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima', 'Gabriel Torres') THEN 'lost'
    ELSE 'active'
  END,
  CASE 
    -- Ganhos/Perdidos não têm data esperada
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Pedro Oliveira', 'Juliana Ferreira', 'Roberto Lima', 'Gabriel Torres') THEN NULL
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN CURRENT_DATE + INTERVAL '15 days'
    WHEN c.name = 'João Silva' THEN CURRENT_DATE + INTERVAL '30 days'
    ELSE CURRENT_DATE + INTERVAL '45 days'
  END,
  CASE 
    -- Ganhos: closed_at com datas variadas
    WHEN c.name = 'Maria Santos' THEN NOW() - INTERVAL '10 days'
    WHEN c.name = 'Lucas Barbosa' THEN NOW() - INTERVAL '5 days'
    WHEN c.name = 'Pedro Oliveira' THEN NOW() - INTERVAL '2 days'
    -- Perdidos: closed_at mais antigas
    WHEN c.name = 'Juliana Ferreira' THEN NOW() - INTERVAL '40 days'
    WHEN c.name = 'Roberto Lima' THEN NOW() - INTERVAL '45 days'
    WHEN c.name = 'Gabriel Torres' THEN NOW() - INTERVAL '50 days'
    -- Ativos: sem closed_at
    ELSE NULL
  END,
  ROW_NUMBER() OVER (PARTITION BY 
    CASE 
      WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Pedro Oliveira') THEN 5
      WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima', 'Gabriel Torres') THEN 6
      WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN 3
      WHEN c.name = 'João Silva' THEN 2
      ELSE 1
    END
  )::integer,
  c.created_at + INTERVAL '2 days',
  NOW() - (random() * INTERVAL '1 day')
FROM contacts c;

-- ============================================
-- 6. INSERIR DEALS HISTÓRICOS (para o gráfico)
-- ============================================

-- Inserir 30 deals ganhos distribuídos nos últimos 90 dias
INSERT INTO deals (contact_id, title, value, stage_id, status, expected_close_date, closed_at, position, created_at, updated_at)
SELECT 
  (SELECT id FROM contacts ORDER BY random() LIMIT 1),
  'Deal Histórico ' || generate_series,
  (random() * 100000 + 20000)::numeric(10,2),
  '10000000-0000-0000-0000-000000000005'::uuid, -- Stage "Ganho"
  'won',
  NULL,
  NOW() - (generate_series || ' days')::interval, -- closed_at distribuído
  generate_series,
  NOW() - (generate_series || ' days')::interval - INTERVAL '5 days',
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 30);

-- Verificar dados inseridos
SELECT 'Contatos criados:' as tabela, COUNT(*) as total FROM contacts
UNION ALL
SELECT 'Conversas criadas:', COUNT(*) FROM conversations
UNION ALL
SELECT 'Deals criados:', COUNT(*) FROM deals
UNION ALL
SELECT 'Deals ganhos:', COUNT(*) FROM deals WHERE status = 'won'
UNION ALL
SELECT 'Deals perdidos:', COUNT(*) FROM deals WHERE status = 'lost'
UNION ALL
SELECT 'Deals abertos:', COUNT(*) FROM deals WHERE status = 'open';

-- Resumo financeiro
SELECT 
  'Valor total em negociação' as metrica,
  'R$ ' || TO_CHAR(SUM(value), 'FM999,999,999.00') as valor
FROM deals 
WHERE status = 'open'
UNION ALL
SELECT 
  'Valor total ganho',
  'R$ ' || TO_CHAR(SUM(value), 'FM999,999,999.00')
FROM deals 
WHERE status = 'won'
UNION ALL
SELECT 
  'Valor total perdido',
  'R$ ' || TO_CHAR(SUM(value), 'FM999,999,999.00')
FROM deals 
WHERE status = 'lost';
