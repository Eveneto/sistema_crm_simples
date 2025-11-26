-- Script de dados de teste para o CRM
-- Execute este script no SQL Editor do Supabase

-- Limpar dados existentes (cuidado em produção!)
-- TRUNCATE TABLE deals CASCADE;
-- TRUNCATE TABLE conversations CASCADE;
-- TRUNCATE TABLE contacts CASCADE;

-- Inserir contatos de teste
INSERT INTO contacts (name, email, phone, company, position, status, notes, created_at, updated_at)
VALUES
  -- Contatos Ativos
  ('João Silva', 'joao.silva@techcorp.com.br', '(11) 98765-4321', 'TechCorp Brasil', 'Diretor de TI', 'active', 'Cliente em potencial para solução enterprise. Demonstrou interesse em nossa plataforma de BI.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
  ('Maria Santos', 'maria.santos@innovatech.com', '(21) 99876-5432', 'InnovaTech Solutions', 'CEO', 'active', 'Empresa de médio porte focada em inovação. Bom fit para nossos produtos.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
  ('Pedro Oliveira', 'pedro.oliveira@startup.io', '(11) 97654-3210', 'Startup Innovations', 'CTO', 'active', 'Startup em crescimento rápido. Precisa de soluções escaláveis.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
  ('Ana Costa', 'ana.costa@bigretail.com.br', '(85) 98543-2109', 'Big Retail Nacional', 'Gerente de Compras', 'active', 'Grande varejista com 200+ lojas. Projeto de transformação digital.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),
  ('Carlos Mendes', 'carlos.mendes@fintech.com', '(11) 99321-8765', 'FinTech Brasil', 'CFO', 'active', 'Fintech em expansão. Interesse em nossa solução de analytics.', NOW() - INTERVAL '12 days', NOW() - INTERVAL '6 hours'),
  
  -- Contatos Inativos
  ('Juliana Ferreira', 'juliana@oldcompany.com.br', '(41) 98234-5678', 'Old Company LTDA', 'Diretora Comercial', 'inactive', 'Perdeu interesse após demonstração. Orçamento limitado.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '40 days'),
  ('Roberto Lima', 'roberto.lima@traditional.com', '(48) 97123-4567', 'Traditional Business', 'Gerente', 'inactive', 'Empresa não está pronta para mudanças tecnológicas no momento.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '45 days'),
  
  -- Leads Novos
  ('Fernanda Alves', 'fernanda@newstartup.io', '(11) 96789-0123', 'New Startup Tech', 'Fundadora', 'lead', 'Contato inicial via LinkedIn. Agendar reunião de discovery.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('Ricardo Souza', 'ricardo.souza@enterprise.com.br', '(21) 95678-9012', 'Enterprise Solutions SA', 'VP de Tecnologia', 'lead', 'Indicação de parceiro. Empresa com 500+ funcionários.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('Beatriz Cardoso', 'beatriz@consulting.com', '(11) 94567-8901', 'Consulting Partners', 'Sócia', 'lead', 'Participou do nosso webinar. Interesse em partnership.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Mais contatos para volume
  ('Lucas Barbosa', 'lucas.b@software.com.br', '(31) 93456-7890', 'Software House MG', 'Tech Lead', 'active', 'Procura ferramentas para gestão de projetos internos.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '4 days'),
  ('Camila Rocha', 'camila.rocha@ecommerce.com', '(11) 92345-6789', 'E-commerce Brasil', 'Diretora Digital', 'active', 'Necessita integração com múltiplas plataformas.', NOW() - INTERVAL '22 days', NOW() - INTERVAL '7 days'),
  ('Felipe Martins', 'felipe@agency.com.br', '(21) 91234-5678', 'Digital Agency', 'Diretor Criativo', 'lead', 'Agência buscando ferramenta de gestão de clientes.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('Patricia Dias', 'patricia.dias@healthcare.com.br', '(11) 90123-4567', 'Healthcare Tech', 'Gerente de Inovação', 'active', 'Setor de saúde, precisa compliance LGPD.', NOW() - INTERVAL '28 days', NOW() - INTERVAL '8 days'),
  ('Gabriel Torres', 'gabriel@logistics.com.br', '(19) 89012-3456', 'Logistics Pro', 'Coordenador TI', 'inactive', 'Escolheu concorrente por questão de preço.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days')
ON CONFLICT (email) DO NOTHING;

-- Inserir conversas de teste
INSERT INTO conversations (contact_id, subject, status, priority, last_message_at, created_at, updated_at)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'João Silva' THEN 'Proposta Comercial - Plataforma BI'
    WHEN c.name = 'Maria Santos' THEN 'Dúvidas sobre Licenciamento'
    WHEN c.name = 'Pedro Oliveira' THEN 'Agendamento Demo Técnica'
    WHEN c.name = 'Ana Costa' THEN 'Discussão de Requisitos - Enterprise'
    WHEN c.name = 'Carlos Mendes' THEN 'Follow-up Reunião Executiva'
    WHEN c.name = 'Fernanda Alves' THEN 'Primeira Reunião - Discovery'
    WHEN c.name = 'Ricardo Souza' THEN 'Envio de Case Studies'
    WHEN c.name = 'Lucas Barbosa' THEN 'Suporte Pós-venda'
    WHEN c.name = 'Camila Rocha' THEN 'Integração API - Discussão'
    WHEN c.name = 'Patricia Dias' THEN 'Compliance LGPD - Consulta'
    ELSE 'Contato Inicial'
  END,
  CASE 
    WHEN c.status = 'active' AND c.name IN ('Carlos Mendes', 'Ana Costa', 'Pedro Oliveira') THEN 'open'
    WHEN c.status = 'lead' THEN 'open'
    ELSE 'closed'
  END,
  CASE 
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN 'high'
    WHEN c.name IN ('João Silva', 'Maria Santos', 'Pedro Oliveira') THEN 'medium'
    ELSE 'low'
  END,
  NOW() - (random() * INTERVAL '10 days'),
  c.created_at + INTERVAL '1 day',
  NOW() - (random() * INTERVAL '5 days')
FROM contacts c
WHERE c.status IN ('active', 'lead')
ON CONFLICT DO NOTHING;

-- Inserir negócios/deals de teste
INSERT INTO deals (contact_id, title, value, status, stage, probability, expected_close_date, closed_at, created_at, updated_at)
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
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Pedro Oliveira') THEN 'won'
    WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima', 'Gabriel Torres') THEN 'lost'
    ELSE 'open'
  END,
  CASE 
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa') THEN 'closed_won'
    WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima') THEN 'closed_lost'
    WHEN c.name = 'Pedro Oliveira' THEN 'negotiation'
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN 'proposal'
    WHEN c.name = 'João Silva' THEN 'qualification'
    ELSE 'discovery'
  END,
  CASE 
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa') THEN 100
    WHEN c.name IN ('Juliana Ferreira', 'Roberto Lima') THEN 0
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN 75
    WHEN c.name = 'João Silva' THEN 60
    WHEN c.name = 'Pedro Oliveira' THEN 85
    ELSE 40
  END,
  CASE 
    WHEN c.name IN ('Maria Santos', 'Lucas Barbosa', 'Juliana Ferreira', 'Roberto Lima') THEN NULL
    WHEN c.name IN ('Ana Costa', 'Carlos Mendes') THEN CURRENT_DATE + INTERVAL '15 days'
    WHEN c.name = 'João Silva' THEN CURRENT_DATE + INTERVAL '30 days'
    WHEN c.name = 'Pedro Oliveira' THEN CURRENT_DATE + INTERVAL '7 days'
    ELSE CURRENT_DATE + INTERVAL '45 days'
  END,
  CASE 
    WHEN c.name = 'Maria Santos' THEN NOW() - INTERVAL '10 days'
    WHEN c.name = 'Lucas Barbosa' THEN NOW() - INTERVAL '5 days'
    WHEN c.name = 'Pedro Oliveira' THEN NOW() - INTERVAL '2 days'
    WHEN c.name = 'Juliana Ferreira' THEN NOW() - INTERVAL '40 days'
    WHEN c.name = 'Roberto Lima' THEN NOW() - INTERVAL '45 days'
    ELSE NULL
  END,
  c.created_at + INTERVAL '2 days',
  NOW() - (random() * INTERVAL '3 days')
FROM contacts c
ON CONFLICT DO NOTHING;

-- Inserir mais deals históricos para o gráfico (últimos 90 dias)
INSERT INTO deals (contact_id, title, value, status, stage, probability, closed_at, created_at, updated_at)
SELECT 
  (SELECT id FROM contacts ORDER BY random() LIMIT 1),
  'Deal Histórico ' || generate_series,
  (random() * 100000 + 20000)::numeric(10,2),
  'won',
  'closed_won',
  100,
  NOW() - (generate_series || ' days')::interval,
  NOW() - (generate_series + 5 || ' days')::interval,
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;

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
