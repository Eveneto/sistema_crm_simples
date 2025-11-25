# Planejamento Técnico - CRM Simplificado

## Visão Geral

CRM completo inspirado no HG HUB, desenvolvido com stack moderna e seguindo princípios de Clean Code.

**Princípio norteador:** KISS (Keep It Simple & Stupid)

---

## Stack Tecnológica

| Camada                | Tecnologia                                                    | Justificativa                                                    |
|-----------------------|---------------------------------------------------------------|------------------------------------------------------------------|
| **Frontend**          | Next.js 14+ (App Router)                                     | SSR/SSG, API Routes, tudo em um projeto                          |
| **Estilização**       | Tailwind CSS + shadcn/ui                                     | Componentes prontos, design system consistente                   |
| **UI Components**     | Radix UI + Lucide Icons                                      | Acessíveis, customizáveis, alta qualidade                        |
| **Estado Global**     | Zustand                                                       | Simples, performático, menos boilerplate que Redux               |
| **Backend**           | Supabase (PostgreSQL + Auth + Realtime)                      | Backend completo em minutos, gratuito                            |
| **Autenticação**      | Supabase Auth                                                | Login por e-mail, magic link, OAuth integrado                    |
| **WhatsApp**          | Evolution API                                                | Open-source, webhooks prontos, fácil integração                  |
| **Tempo Real**        | Supabase Realtime                                            | WebSockets nativo, sem configuração manual                       |
| **Drag and Drop**     | @dnd-kit                                                     | Performático, acessível, TypeScript first                        |
| **Gráficos**          | Recharts                                                     | Simples, responsivo, customizável                                |
| **Datas**             | date-fns                                                     | Leve, tree-shakeable, melhor que moment.js                       |
| **Deploy**            | Vercel                                                       | Deploy automático, edge functions, zero config                   |

---

## Estrutura de Pastas

```
crm_simplificado/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Rotas de autenticação (grupo de layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/             # Rotas protegidas (grupo de layout)
│   │   │   ├── layout.tsx          # Layout com Sidebar + Header
│   │   │   │
│   │   │   ├── page.tsx            # Dashboard principal (visão geral)
│   │   │   │
│   │   │   ├── conversas/
│   │   │   │   ├── page.tsx        # Lista de conversas
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Chat individual
│   │   │   │
│   │   │   ├── crm/
│   │   │   │   ├── negocios/
│   │   │   │   │   └── page.tsx    # Kanban pipeline
│   │   │   │   ├── contatos/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── atividades/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── tags/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── canais/
│   │   │   │   └── page.tsx        # Gestão de canais WhatsApp
│   │   │   │
│   │   │   ├── recursos/
│   │   │   │   ├── chats/
│   │   │   │   ├── agendamentos/
│   │   │   │   ├── modelos/
│   │   │   │   ├── links/
│   │   │   │   └── biblioteca/
│   │   │   │
│   │   │   └── configuracoes/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                     # API Routes
│   │   │   ├── webhook/
│   │   │   │   └── whatsapp/
│   │   │   │       └── route.ts    # Webhook Evolution API
│   │   │   └── deals/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css
│   │
│   ├── components/                  # Componentes React
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── app-sidebar.tsx    # Sidebar principal do app
│   │   │   ├── header.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── metrics-card.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   └── recent-deals.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── conversation-list.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── chat-input.tsx
│   │   │   └── chat-header.tsx
│   │   │
│   │   ├── kanban/
│   │   │   ├── board.tsx
│   │   │   ├── column.tsx
│   │   │   ├── deal-card.tsx
│   │   │   └── add-deal-dialog.tsx
│   │   │
│   │   └── canais/
│   │       ├── channel-list.tsx
│   │       └── qr-code-dialog.tsx
│   │
│   ├── lib/                         # Utilitários e configurações
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente Supabase
│   │   │   ├── server.ts          # Server-side Supabase
│   │   │   └── middleware.ts      # Middleware auth
│   │   │
│   │   ├── evolution/
│   │   │   ├── client.ts          # Cliente Evolution API
│   │   │   └── webhook.ts         # Handler de webhooks
│   │   │
│   │   └── utils.ts               # Funções utilitárias
│   │
│   ├── stores/                      # Estado global (Zustand)
│   │   ├── use-auth-store.ts
│   │   ├── use-chat-store.ts
│   │   └── use-deals-store.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── database.ts            # Tipos do Supabase
│   │   ├── deals.ts
│   │   ├── conversations.ts
│   │   └── index.ts
│   │
│   └── hooks/                       # Custom hooks
│       ├── use-conversations.ts
│       ├── use-deals.ts
│       └── use-realtime.ts
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── .env.local                       # Variáveis de ambiente
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── CODE_REVIEW_GUIDE.md            # Guia de boas práticas
└── README.md
```

---

## Fluxo de Dados

### 1. Autenticação
```
Usuário → Login Form → Supabase Auth → JWT Token → Cookie
                                              ↓
                                       Redirect Dashboard
```

### 2. Conversas WhatsApp (Tempo Real)
```
Cliente envia mensagem no WhatsApp
        ↓
Evolution API recebe
        ↓
Webhook → /api/webhook/whatsapp
        ↓
Salva no Supabase (conversations + messages)
        ↓
Supabase Realtime → Frontend atualiza automaticamente
        ↓
Atendente vê mensagem no chat
        ↓
Atendente responde
        ↓
Frontend → Evolution API → WhatsApp Cliente
```

### 3. Kanban de Negócios
```
Usuário arrasta card (deal)
        ↓
@dnd-kit detecta movimento
        ↓
onDragEnd → atualiza store (Zustand)
        ↓
API call → Supabase (atualiza stage_id e position)
        ↓
Optimistic update → UI responde instantaneamente
```

---

## Schema do Banco de Dados (Supabase)

### Tabelas principais:

#### `users`
```sql
- id: uuid (PK)
- email: string
- full_name: string
- avatar_url: string
- role: enum ('admin', 'agent', 'manager')
- created_at: timestamp
```

#### `conversations`
```sql
- id: uuid (PK)
- contact_id: uuid (FK → contacts)
- channel_id: uuid (FK → channels)
- assigned_to: uuid (FK → users)
- status: enum ('open', 'closed', 'pending')
- last_message_at: timestamp
- unread_count: integer
- created_at: timestamp
```

#### `messages`
```sql
- id: uuid (PK)
- conversation_id: uuid (FK → conversations)
- sender_type: enum ('user', 'contact')
- sender_id: uuid
- content: text
- media_url: string (nullable)
- message_type: enum ('text', 'image', 'video', 'audio', 'document')
- whatsapp_message_id: string (nullable)
- created_at: timestamp
```

#### `contacts`
```sql
- id: uuid (PK)
- name: string
- phone: string (unique)
- email: string (nullable)
- avatar_url: string (nullable)
- tags: text[] (array de tags)
- custom_fields: jsonb
- created_at: timestamp
```

#### `deals`
```sql
- id: uuid (PK)
- title: string
- contact_id: uuid (FK → contacts)
- stage_id: uuid (FK → deal_stages)
- value: decimal
- expected_close_date: date (nullable)
- assigned_to: uuid (FK → users)
- position: integer (ordem no kanban)
- status: enum ('active', 'won', 'lost')
- created_at: timestamp
- updated_at: timestamp
```

#### `deal_stages`
```sql
- id: uuid (PK)
- name: string
- color: string
- position: integer
- created_at: timestamp
```

#### `channels`
```sql
- id: uuid (PK)
- type: enum ('whatsapp', 'telegram', 'webchat')
- name: string
- phone: string (para WhatsApp)
- is_connected: boolean
- evolution_instance_id: string (nullable)
- config: jsonb
- created_at: timestamp
```

#### `activities`
```sql
- id: uuid (PK)
- type: enum ('call', 'email', 'meeting', 'note', 'task')
- title: string
- description: text (nullable)
- contact_id: uuid (FK → contacts)
- deal_id: uuid (FK → deals, nullable)
- assigned_to: uuid (FK → users)
- due_date: timestamp (nullable)
- completed: boolean
- created_at: timestamp
```

---

## MVP - Funcionalidades Essenciais (3 semanas)

### Semana 1: Setup + Autenticação + Layout
- [x] Setup do projeto Next.js 14 + TypeScript
- [ ] Configuração Tailwind + shadcn/ui
- [ ] Setup Supabase
- [ ] Sistema de login/registro
- [ ] Layout principal (Sidebar + Header)
- [ ] Proteção de rotas

### Semana 2: Dashboard + Conversas
- [ ] Dashboard com métricas básicas
- [ ] Gráficos de vendas (Recharts)
- [ ] Lista de conversas
- [ ] Chat em tempo real (Supabase Realtime)
- [ ] Integração Evolution API (webhook receber mensagens)
- [ ] Envio de mensagens via WhatsApp

### Semana 3: CRM + Canais
- [ ] Kanban de negócios (drag and drop)
- [ ] CRUD de deals
- [ ] CRUD de contatos
- [ ] Lista de atividades
- [ ] Gestão de canais (conectar WhatsApp via QR Code)
- [ ] Testes básicos

---

## Padrões de Código (Clean Code)

### Nomenclatura
```typescript
// ✅ BOM
function handleCreateDeal(data: CreateDealInput) { }
const isConversationOpen = conversation.status === 'open';

// ❌ RUIM
function handle(d: any) { }
const flag = conv.status === 'open';
```

### Componentes React
```typescript
// ✅ BOM - Componente pequeno, single responsibility
interface DealCardProps {
  deal: Deal;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{formatCurrency(deal.value)}</p>
      </CardContent>
    </Card>
  );
}
```

### Custom Hooks
```typescript
// ✅ BOM - Lógica extraída do componente
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { conversations, loading, error, reload: loadConversations };
}
```

---

## Configuração de Ferramentas

### ESLint + Prettier
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Husky + lint-staged
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Próximos Passos

1. ✅ Criar estrutura de pastas
2. ✅ Configurar Next.js + TypeScript
3. ⏳ Instalar e configurar shadcn/ui
4. ⏳ Setup Supabase (criar projeto, tabelas)
5. ⏳ Implementar autenticação
6. ⏳ Criar layout (Sidebar + Header)
7. ⏳ Dashboard com métricas
8. ⏳ Módulo de conversas
9. ⏳ Integração WhatsApp
10. ⏳ Kanban de negócios

---

**Última atualização:** 25 de novembro de 2025  
**Status:** Setup inicial em andamento
