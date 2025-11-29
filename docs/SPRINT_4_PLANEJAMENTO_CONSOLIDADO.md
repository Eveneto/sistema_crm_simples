# Sprint 4 - Pipeline de Vendas + Otimização

**Início:** 12/12/2024  
**Duração:** 2 semanas  
**Meta:** 30 pontos  
**Abordagem:** KISS + Clean Code  
**Foco:** Pipeline visual (Kanban) + Performance crítica

---

## 🎯 Visão Geral

### Objetivos Principais

Após 3 sprints de features, esta sprint equilibra:

1. **Feature Core:** Pipeline visual de vendas (Kanban drag-and-drop)
2. **Performance:** Otimizações críticas onde impacta
3. **Pragmatismo:** Implementar o essencial, sem over-engineering

### Princípios KISS Aplicados

✅ **Fazer:** O que agrega valor imediato  
❌ **Evitar:** Over-engineering, otimização prematura  
🎯 **Foco:** Experiência do usuário primeiro, performance quando necessário

---

## 📊 Story Points (30 total)

### Epic 1: Pipeline de Vendas (22 pts)
- US-038: Visualizar Kanban (5 pts)
- US-039: Criar Negócio (3 pts)
- US-040: Editar Negócio (3 pts)
- US-041: Drag and Drop (8 pts) - **Complexo**
- US-042: Detalhes (3 pts)

### Epic 2: Performance Crítica (8 pts)
- US-043: Code Splitting Essencial (3 pts)
- US-044: Database Indexes (3 pts)
- US-045: Monitoramento Básico (2 pts)

---

## 🎨 Epic 1: Pipeline de Vendas (22 pts)

### US-038: Visualizar Kanban de Negócios (5 pts)

**Como** vendedor  
**Quero** ver todos os negócios organizados por estágio  
**Para** ter visão clara do pipeline

#### Critérios de Aceitação ✅
- [ ] Colunas de estágios: Lead → Qualificação → Proposta → Negociação → Fechado
- [ ] Cards mostram: título, valor (R$), contato, data
- [ ] Badge colorido por status (ativo, ganho, perdido)
- [ ] Contador de negócios e valor total por coluna
- [ ] Scroll horizontal se muitas colunas
- [ ] Responsivo: mobile mostra 1 coluna por vez

#### Implementação (KISS)

**Estrutura Simples:**
```
/dashboard/deals/pipeline/page.tsx
/components/deals/
  ├── pipeline-board.tsx      # Container principal
  ├── pipeline-column.tsx     # Coluna (estágio)
  ├── deal-card.tsx           # Card do negócio
  └── deal-stats.tsx          # Estatísticas (count + total)
```

**Componente Principal (Clean Code):**
```typescript
// pipeline-board.tsx
export function PipelineBoard({ stages, deals }: Props) {
  // Agrupa deals por stage_id
  const dealsByStage = groupBy(deals, 'stage_id');

  return (
    <div className="flex gap-4 overflow-x-auto">
      {stages.map(stage => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          deals={dealsByStage[stage.id] || []}
        />
      ))}
    </div>
  );
}
```

**API Simples:**
```typescript
// GET /api/deals?view=pipeline
export async function GET() {
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      id, title, value, status, stage_id,
      contact:contacts(id, name),
      stage:stages(id, name, order)
    `)
    .order('position');

  return NextResponse.json(deals);
}
```

#### Arquivos
- `src/app/(dashboard)/dashboard/deals/pipeline/page.tsx` (nova)
- `src/components/deals/pipeline-board.tsx` (nova)
- `src/components/deals/pipeline-column.tsx` (nova)
- `src/components/deals/deal-card.tsx` (nova)
- `src/app/api/deals/route.ts` (modificar)

#### Testes Críticos (KISS)
```typescript
// 3 testes essenciais
1. Renderiza todas as colunas
2. Agrupa deals corretamente por estágio
3. Calcula totais (count + valor) corretamente
```

---

### US-039: Criar Novo Negócio (3 pts)

**Como** vendedor  
**Quero** criar um novo negócio  
**Para** começar a acompanhar uma oportunidade

#### Critérios de Aceitação ✅
- [ ] Botão "Novo Negócio" no header
- [ ] Formulário: título*, contato*, estágio*, valor, data esperada
- [ ] Validação Zod: título e contato obrigatórios
- [ ] Autocomplete de contatos (busca por nome/email)
- [ ] Card aparece na coluna correta após criar
- [ ] Toast de sucesso

#### Implementação (Clean Code)

**Validação (Single Responsibility):**
```typescript
// lib/validations/deal.ts
export const createDealSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  contact_id: z.string().uuid('Selecione um contato'),
  stage_id: z.string().uuid('Selecione um estágio'),
  value: z.number().min(0).default(0),
  expected_close_date: z.string().optional(),
});
```

**Formulário (DRY):**
```typescript
// components/deals/deal-form.tsx
export function DealForm({ onSubmit, initialData }: Props) {
  const form = useForm({
    resolver: zodResolver(createDealSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <FormField name="title" label="Título" required />
      <FormField name="contact_id" label="Contato" required>
        <ContactAutocomplete />
      </FormField>
      <FormField name="stage_id" label="Estágio" required>
        <StageSelect />
      </FormField>
      <FormField name="value" label="Valor" type="number" />
      <FormField name="expected_close_date" label="Previsão" type="date" />
    </Form>
  );
}
```

**API (Clean):**
```typescript
// POST /api/deals
export async function POST(request: Request) {
  const body = await request.json();
  const validated = createDealSchema.parse(body);

  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...validated,
      user_id: session.user.id,
      status: 'active',
      position: 0, // Topo da coluna
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(data);
}
```

#### Arquivos
- `src/lib/validations/deal.ts` (nova)
- `src/components/deals/deal-form.tsx` (nova)
- `src/components/deals/contact-autocomplete.tsx` (nova)
- `src/app/api/deals/route.ts` (modificar POST)

#### Testes Críticos
```typescript
// 4 testes essenciais
1. Validação: título obrigatório
2. Validação: contact_id obrigatório
3. API POST: cria com dados válidos
4. API POST: retorna erro com dados inválidos
```

---

### US-040: Editar Negócio (3 pts)

**Como** vendedor  
**Quero** editar informações de um negócio  
**Para** mantê-lo atualizado

#### Critérios de Aceitação ✅
- [ ] Botão "Editar" no card
- [ ] Modal com formulário preenchido
- [ ] Campos editáveis: título, valor, data, estágio
- [ ] Atualização visual imediata (optimistic)
- [ ] Toast de sucesso

#### Implementação (DRY - Reusar Componentes)

**Reutilizar DealForm:**
```typescript
// components/deals/deal-form.tsx já criado
// Apenas passar mode: 'create' | 'edit'

export function DealForm({ mode, initialData, onSubmit }: Props) {
  const schema = mode === 'edit' 
    ? createDealSchema.partial() // Campos opcionais
    : createDealSchema;

  // Resto igual...
}
```

**API (RESTful):**
```typescript
// PATCH /api/deals/[id]
export async function PATCH(request: Request, { params }: Context) {
  const body = await request.json();
  const validated = createDealSchema.partial().parse(body);

  const { data, error } = await supabase
    .from('deals')
    .update(validated)
    .eq('id', params.id)
    .eq('user_id', session.user.id) // RLS
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(data);
}
```

#### Arquivos
- `src/components/deals/deal-form.tsx` (modificar - adicionar mode)
- `src/app/api/deals/[id]/route.ts` (nova)

#### Testes Críticos
```typescript
// 3 testes essenciais
1. API PATCH: atualiza com dados válidos
2. API PATCH: valida permissão (RLS)
3. Componente: modo edit preenche valores iniciais
```

---

### US-041: Drag and Drop entre Estágios (8 pts) ⚠️

**Como** vendedor  
**Quero** arrastar negócios entre colunas  
**Para** atualizar o estágio rapidamente

#### Critérios de Aceitação ✅
- [ ] Arrastar card de uma coluna para outra
- [ ] Durante drag: card semi-transparente
- [ ] Durante drag over: coluna destino muda cor
- [ ] Ao soltar: atualiza no banco (API)
- [ ] Optimistic update: move antes da API responder
- [ ] Se API falhar: rollback + toast de erro
- [ ] Negócios fechados (won/lost) não podem ser movidos

#### Implementação (KISS - Usar Biblioteca Testada)

**Biblioteca:**
```bash
npm install @hello-pangea/dnd
```

**Motivo:** Fork mantido do react-beautiful-dnd, estável e acessível

**Integração Simples:**
```typescript
// pipeline-board.tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function PipelineBoard({ stages, deals }: Props) {
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const dealId = result.draggableId;
    const newStageId = result.destination.droppableId;
    const newPosition = result.destination.index;

    // Optimistic update (UI imediata)
    updateLocalState(dealId, newStageId, newPosition);

    try {
      // API call (background)
      await updateDeal(dealId, { stage_id: newStageId, position: newPosition });
      toast.success('Negócio movido!');
    } catch (error) {
      // Rollback em caso de erro
      revertLocalState();
      toast.error('Erro ao mover negócio');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {stages.map(stage => (
          <Droppable key={stage.id} droppableId={stage.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={snapshot.isDraggingOver ? 'bg-blue-50' : ''}
              >
                {dealsByStage[stage.id]?.map((deal, index) => (
                  <Draggable
                    key={deal.id}
                    draggableId={deal.id}
                    index={index}
                    isDragDisabled={deal.status !== 'active'}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        <DealCard deal={deal} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

**API (Simples):**
```typescript
// PATCH /api/deals/[id]
// Atualiza stage_id e position
export async function PATCH(request: Request, { params }: Context) {
  const { stage_id, position } = await request.json();

  const { data, error } = await supabase
    .from('deals')
    .update({ stage_id, position, updated_at: new Date() })
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  return NextResponse.json(data);
}
```

**State Management (KISS - useState):**
```typescript
// Não precisa Zustand para MVP
// useState + optimistic updates é suficiente

const [deals, setDeals] = useState(initialDeals);

function updateLocalState(dealId, newStageId, newPosition) {
  setDeals(prev => {
    const updated = prev.map(d => 
      d.id === dealId 
        ? { ...d, stage_id: newStageId, position: newPosition }
        : d
    );
    return sortByPosition(updated);
  });
}
```

#### Arquivos
- `package.json` (adicionar @hello-pangea/dnd)
- `src/components/deals/pipeline-board.tsx` (modificar - adicionar DnD)
- `src/app/api/deals/[id]/route.ts` (modificar PATCH)

#### Testes Críticos
```typescript
// 4 testes essenciais (mock da biblioteca)
1. onDragEnd: atualiza estado local
2. onDragEnd: chama API com dados corretos
3. onDragEnd: rollback se API falhar
4. Drag desabilitado se status !== 'active'
```

---

### US-042: Visualizar Detalhes do Negócio (3 pts)

**Como** vendedor  
**Quero** ver todos os detalhes de um negócio  
**Para** ter informações completas

#### Critérios de Aceitação ✅
- [ ] Clicar no card abre modal
- [ ] Exibe: título, valor, contato (com link), estágio, status, datas
- [ ] Botão "Editar" no modal
- [ ] Botão "Fechar"

#### Implementação (Simples)

**Modal Simples:**
```typescript
// components/deals/deal-details-modal.tsx
export function DealDetailsModal({ dealId, isOpen, onClose }: Props) {
  const { data: deal } = useSWR(
    isOpen ? `/api/deals/${dealId}` : null
  );

  if (!deal) return <Spinner />;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deal.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DetailRow label="Valor" value={formatCurrency(deal.value)} />
          <DetailRow label="Contato">
            <Link href={`/contacts/${deal.contact.id}`}>
              {deal.contact.name}
            </Link>
          </DetailRow>
          <DetailRow label="Estágio" value={deal.stage.name} />
          <DetailRow label="Status" value={<StatusBadge status={deal.status} />} />
          <DetailRow label="Criado em" value={formatDate(deal.created_at)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => openEditModal(deal)}>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**API (RESTful):**
```typescript
// GET /api/deals/[id]
export async function GET(request: Request, { params }: Context) {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      contact:contacts(id, name, email),
      stage:stages(id, name),
      assigned_to_user:users(id, name)
    `)
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (error) throw error;
  return NextResponse.json(data);
}
```

#### Arquivos
- `src/components/deals/deal-details-modal.tsx` (nova)
- `src/app/api/deals/[id]/route.ts` (modificar GET)

#### Testes Críticos
```typescript
// 2 testes essenciais
1. API GET: retorna deal com joins
2. Componente: renderiza informações corretamente
```

---

## ⚡ Epic 2: Performance Crítica (8 pts)

### Abordagem KISS para Performance

❌ **Evitar:**
- Over-engineering (service workers, CDN personalizada)
- Otimização prematura (cache complexo antes de medir)
- Micro-otimizações que não movem a agulha

✅ **Focar:**
- Code splitting onde impacta (páginas pesadas)
- Database indexes em queries lentas
- Monitoramento básico para dados reais

---

### US-043: Code Splitting Essencial (3 pts)

**Como** sistema  
**Quero** carregar apenas o JavaScript necessário  
**Para** reduzir tempo de carregamento inicial

#### O Que Fazer (KISS)

**1. Lazy Load de Páginas Pesadas:**
```typescript
// app/dashboard/layout.tsx
import dynamic from 'next/dynamic';

// Página de relatórios (gráficos pesados)
const ConversionReport = dynamic(
  () => import('@/components/reports/conversion-report'),
  {
    loading: () => <ReportSkeleton />,
    ssr: false, // Client-side only
  }
);

// Pipeline (drag-and-drop library pesada)
const PipelineBoard = dynamic(
  () => import('@/components/deals/pipeline-board'),
  {
    loading: () => <PipelineSkeleton />,
  }
);
```

**2. Otimizar Bundle (next.config.js):**
```javascript
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Analise com ANALYZE=true npm run build
};
```

**3. Skeleton Loaders (UX):**
```typescript
// Componentes simples de loading
export function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" /> {/* Título */}
      <Skeleton className="h-[300px] w-full" /> {/* Gráfico */}
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
```

#### Arquivos
- `next.config.js` (modificar)
- Páginas pesadas (adicionar dynamic import)
- `src/components/ui/skeleton.tsx` (shadcn/ui)

#### Medição de Sucesso
- First Load JS: < 200 KB (atual ~250 KB)
- Lighthouse Performance: > 85 (atual ~70)

---

### US-044: Database Indexes (3 pts)

**Como** sistema  
**Quero** queries SQL rápidas  
**Para** responder em < 500ms

#### O Que Fazer (KISS)

**1. Identificar Queries Lentas:**
```sql
-- Rodar EXPLAIN ANALYZE nas principais queries
EXPLAIN ANALYZE
SELECT * FROM deals
WHERE user_id = '...'
  AND stage_id = '...'
ORDER BY position;
```

**2. Criar Índices Estratégicos:**
```sql
-- Migration: 20241212_add_critical_indexes.sql

-- Deals (queries mais frequentes)
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_user_stage ON deals(user_id, stage_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);

-- Contacts (autocomplete)
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Tasks (dashboard widgets)
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status != 'completed';
```

**3. Paginação Simples:**
```typescript
// API com limit básico (suficiente para MVP)
export async function GET(request: NextRequest) {
  const limit = 100; // Limite razoável

  const { data } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('position')
    .limit(limit);

  return NextResponse.json(data);
}
```

#### Arquivos
- `supabase/migrations/20241212_add_critical_indexes.sql` (nova)
- APIs (adicionar .limit() onde falta)

#### Medição de Sucesso
- Query time: < 100ms (indexed)
- GET /api/deals: < 300ms total

---

### US-045: Monitoramento Básico (2 pts)

**Como** desenvolvedor  
**Quero** medir performance real  
**Para** saber se otimizações funcionaram

#### O Que Fazer (KISS)

**1. Vercel Analytics (Built-in):**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**2. Lighthouse CI (GitHub Actions):**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/dashboard
            http://localhost:3000/dashboard/deals/pipeline
          uploadArtifacts: true
```

**3. Performance Budget (Basic):**
```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "interactive": ["warn", { "maxNumericValue": 5000 }]
      }
    }
  }
}
```

#### Arquivos
- `src/app/layout.tsx` (modificar)
- `.github/workflows/lighthouse.yml` (nova)
- `lighthouserc.json` (nova)

#### Medição de Sucesso
- Lighthouse CI rodando em PRs
- Vercel Analytics ativo
- Baseline estabelecido

---

## 🧪 Estratégia de Testes (KISS)

### Foco em Testes Críticos

**O Que Testar:**
✅ Lógica de negócio (cálculos, validações)  
✅ APIs (CRUD, validações)  
✅ Componentes core (PipelineBoard, DealCard, DealForm)  
✅ Drag and drop (mock básico)

**O Que NÃO Testar (YAGNI):**
❌ Componentes triviais (botões, badges)  
❌ shadcn/ui components (já testados)  
❌ Formatação de datas/valores (libs confiáveis)

### Meta de Coverage

**Pragmática:** 35-45% (não buscar 80%+)

**Por Quê?**
- Foco em código crítico
- Evitar testes triviais
- Manutenção sustentável

### Testes por US

| US | Testes Unitários | Testes E2E |
|----|------------------|------------|
| US-038 | 3 (board, column, card) | - |
| US-039 | 4 (validação + API) | - |
| US-040 | 3 (API + component) | - |
| US-041 | 4 (drag logic) | 1 (fluxo completo) |
| US-042 | 2 (API + modal) | - |
| US-043 | 1 (bundle analysis) | - |
| US-044 | 1 (query performance) | - |
| US-045 | - (config only) | - |

**Total:** ~18 testes unitários + 1 E2E

---

## 📅 Cronograma (2 semanas)

### Semana 1: Core Features

**Dia 1-2 (12-13/12):**
- [ ] Setup @hello-pangea/dnd
- [ ] Estrutura de pastas
- [ ] US-038: Visualizar Kanban (board + columns + cards)

**Dia 3-4 (14-15/12):**
- [ ] US-039: Criar Negócio (form + validation + API POST)
- [ ] US-040: Editar Negócio (reusar form + API PATCH)
- [ ] Testes (validação + APIs)

**Dia 5 (16/12):**
- [ ] US-042: Detalhes do Negócio (modal + API GET)
- [ ] Polimento de UI (skeleton loaders)

### Semana 2: Drag-and-Drop + Performance

**Dia 6-8 (19-21/12):**
- [ ] US-041: Drag and Drop (implementação + optimistic updates)
- [ ] Testes de drag (mock library)
- [ ] E2E básico (fluxo completo)

**Dia 9 (22/12):**
- [ ] US-043: Code Splitting (dynamic imports)
- [ ] US-044: Database Indexes (migration)
- [ ] US-045: Monitoramento (Vercel Analytics + Lighthouse CI)

**Dia 10 (23/12):**
- [ ] Code review
- [ ] Ajustes finais
- [ ] Documentação

**Dia 11 (24/12):**
- [ ] Sprint Review
- [ ] Deploy staging
- [ ] Sprint Retrospective

---

## 📊 Métricas de Sucesso

### Funcional
- [ ] Pipeline visual funcionando
- [ ] Drag-and-drop intuitivo (60 FPS)
- [ ] CRUD completo de negócios
- [ ] Todas as validações server-side

### Performance
- [ ] Lighthouse Performance > 85
- [ ] First Load JS < 200 KB
- [ ] Query time < 100ms (indexed)
- [ ] GET /api/deals < 300ms

### Qualidade
- [ ] 18+ testes unitários passando
- [ ] 1 teste E2E (fluxo completo)
- [ ] Zero erros TypeScript
- [ ] Coverage 35-45%

### UX
- [ ] Loading states em todas ações
- [ ] Skeleton loaders nas páginas pesadas
- [ ] Toast feedback (sucesso/erro)
- [ ] Optimistic updates no drag

---

## 🚧 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade do drag-and-drop | Alta | Alto | Usar @hello-pangea/dnd (testada) |
| Performance com 100+ deals | Média | Médio | Limite de 100 por query (suficiente) |
| Optimistic UI bugs | Média | Médio | Rollback automático + toast |
| Tempo insuficiente | Baixa | Alto | Priorizar US-038 e US-041 (core) |

---

## ✅ Definition of Done

### Funcional
- [ ] 5 User Stories de pipeline implementadas
- [ ] 3 User Stories de performance implementadas
- [ ] Drag-and-drop funcionando suavemente
- [ ] CRUD completo de negócios

### Técnico
- [ ] Zero erros TypeScript/ESLint
- [ ] Build passa sem warnings
- [ ] 18+ testes unitários + 1 E2E
- [ ] Coverage 35-45%

### Performance
- [ ] Lighthouse > 85
- [ ] First Load JS < 200 KB
- [ ] Database queries < 100ms
- [ ] APIs < 300ms

### Segurança
- [ ] RLS habilitado na tabela `deals`
- [ ] Validação server-side em todas APIs
- [ ] Autenticação obrigatória

### Documentação
- [ ] README atualizado
- [ ] Componentes documentados (JSDoc)
- [ ] APIs documentadas
- [ ] Este documento atualizado com conclusões

---

## 🎯 Valor Entregue

Ao final desta Sprint, o usuário poderá:

1. ✅ **Visualizar** pipeline de vendas organizado por estágios
2. ✅ **Criar** novos negócios vinculados a contatos
3. ✅ **Editar** informações de negócios existentes
4. ✅ **Mover** negócios entre estágios com drag-and-drop intuitivo
5. ✅ **Visualizar** detalhes completos de cada negócio
6. ✅ **Experiência rápida** com código otimizado onde importa

**Resultado:** CRM profissional com gestão visual de pipeline! 🚀

---

## 📚 Referências

### Técnicas
- [@hello-pangea/dnd Docs](https://github.com/hello-pangea/dnd)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Analytics](https://vercel.com/docs/analytics)

### Design Patterns
- Clean Code: SRP, DRY, KISS
- Optimistic UI: React Query patterns
- RESTful APIs: Conventional endpoints

### Inspirações
- Linear: Pipeline simples e rápido
- Trello: Kanban clássico
- Pipedrive: CRM profissional

---

**Criado em:** 29/11/2024  
**Abordagem:** KISS + Clean Code + Pragmatismo  
**Versão:** 2.0 (Consolidado)

