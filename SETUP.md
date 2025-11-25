# Setup do Projeto CRM Simplificado

Este guia mostra como configurar o projeto do zero.

## 1. Instalação de Dependências

Execute o comando para instalar todas as dependências:

```bash
npm install
```

## 2. Configurar shadcn/ui

Instale os componentes essenciais do shadcn/ui:

```bash
# Inicializar shadcn/ui (já está configurado via components.json)
npx shadcn-ui@latest init

# Adicionar componentes necessários
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
npx shadcn-ui@latest add sidebar
```

## 3. Configurar Supabase

### 3.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Crie um novo projeto:
   - Nome: `crm-simplificado`
   - Senha do banco: (escolha uma senha forte)
   - Região: South America (São Paulo) - para melhor latência

### 3.2 Copiar credenciais

Após criar o projeto, vá em **Settings > API**:

- Copie a **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
- Copie a **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Copie a **service_role key** (SUPABASE_SERVICE_ROLE_KEY)

### 3.3 Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.4 Executar migrations (SQL)

No Supabase Dashboard, vá em **SQL Editor** e execute os scripts abaixo:

#### Script 1: Criar tabelas

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (já existe via Supabase Auth, apenas adicionar campos customizados)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar_url TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'telegram', 'webchat')),
  name TEXT NOT NULL,
  phone TEXT,
  is_connected BOOLEAN DEFAULT FALSE,
  evolution_instance_id TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'contact')),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document')),
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Stages
CREATE TABLE deal_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES deal_stages(id) ON DELETE CASCADE,
  value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expected_close_date DATE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
  title TEXT NOT NULL,
  description TEXT,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para melhor performance
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
```

#### Script 2: Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies para contacts (todos os usuários autenticados)
CREATE POLICY "Authenticated users can view contacts" ON contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contacts" ON contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts" ON contacts
  FOR UPDATE TO authenticated USING (true);

-- Policies para channels
CREATE POLICY "Authenticated users can view channels" ON channels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage channels" ON channels
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policies para conversations
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update conversations" ON conversations
  FOR UPDATE TO authenticated USING (true);

-- Policies para messages
CREATE POLICY "Users can view messages" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policies para deal_stages
CREATE POLICY "Users can view deal stages" ON deal_stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage deal stages" ON deal_stages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Policies para deals
CREATE POLICY "Users can view deals" ON deals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert deals" ON deals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update deals" ON deals
  FOR UPDATE TO authenticated USING (true);

-- Policies para activities
CREATE POLICY "Users can view activities" ON activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their activities" ON activities
  FOR ALL TO authenticated USING (assigned_to = auth.uid());
```

#### Script 3: Dados iniciais (seed)

```sql
-- Inserir stages padrão do pipeline
INSERT INTO deal_stages (name, color, position) VALUES
  ('Sem Contato', '#94a3b8', 1),
  ('Prospecção', '#3b82f6', 2),
  ('Prospecção 2', '#8b5cf6', 3),
  ('Conexão', '#f59e0b', 4),
  ('Fechado/Ganho', '#10b981', 5),
  ('Perdido', '#ef4444', 6);
```

## 4. Configurar Evolution API (WhatsApp)

### Opção 1: Usar instância hospedada

Se você já tem uma Evolution API rodando:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE_NAME=crm_instance
```

### Opção 2: Rodar localmente (Docker)

```bash
# Clone o repositório da Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configure o .env
cp .env.example .env

# Rode com Docker
docker-compose up -d
```

URL padrão: `http://localhost:8080`

## 5. Configurar Git Hooks (Husky)

```bash
npm run prepare
```

Isso instalará os hooks do Husky para rodar lint e format antes de cada commit.

## 6. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 7. Verificar se está tudo funcionando

- [ ] Projeto roda sem erros
- [ ] Consegue conectar no Supabase
- [ ] Tema dark/light funciona
- [ ] Não há erros de lint (`npm run lint`)
- [ ] TypeScript compila (`npm run type-check`)

## Próximos passos

Agora você está pronto para começar o desenvolvimento! Siga a ordem:

1. Implementar autenticação
2. Criar sidebar e header
3. Dashboard com métricas
4. Módulo de conversas
5. Kanban de negócios

Consulte o [PLANEJAMENTO_TECNICO.md](PLANEJAMENTO_TECNICO.md) para mais detalhes.

---

**Em caso de dúvidas, abra uma issue no repositório!**
