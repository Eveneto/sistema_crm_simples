# Quick Start Guide - CRM Simplificado

Guia rápido para começar a desenvolver em 5 minutos! ⚡

---

## 🚀 Setup Rápido (5 minutos)

### 1. Clone e Instale

```bash
git clone https://github.com/Eveneto/sistema_crm_simples.git
cd sistema_crm_simples
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Ainda não tem Supabase?**

1. Acesse [supabase.com](https://supabase.com)
2. Crie conta gratuita
3. Crie novo projeto (5 min)
4. Copie as credenciais (Settings > API)

### 3. Rode o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentação Completa

| Precisa de...                  | Leia...                                            |
| ------------------------------ | -------------------------------------------------- |
| 🛠️ **Setup detalhado**         | [SETUP.md](SETUP.md)                               |
| 🏗️ **Arquitetura técnica**     | [PLANEJAMENTO_TECNICO.md](PLANEJAMENTO_TECNICO.md) |
| 📋 **Metodologia Scrum**       | [PLANEJAMENTO_SCRUM.md](PLANEJAMENTO_SCRUM.md)     |
| ✨ **Boas práticas de código** | [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)       |
| 🤝 **Como contribuir**         | [CONTRIBUTING.md](CONTRIBUTING.md)                 |
| 📝 **Templates do dia a dia**  | [TEMPLATES_SCRUM.md](TEMPLATES_SCRUM.md)           |

---

## 🧑‍💻 Workflow de Desenvolvimento

### Criar Nova Feature

```bash
# 1. Certifique-se que está na main atualizada
git checkout main
git pull origin main

# 2. Crie uma branch
git checkout -b feature/US-XXX-nome-da-feature

# 3. Desenvolva (seguindo CODE_REVIEW_GUIDE.md)

# 4. Commit (Conventional Commits)
git add .
git commit -m "feat(modulo): descrição da feature"

# 5. Push
git push origin feature/US-XXX-nome-da-feature

# 6. Abra Pull Request no GitHub
```

### Comandos Úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar erros
npm run lint:fix     # Corrigir erros automaticamente
npm run format       # Formatar código
npm run type-check   # Verificar tipos TypeScript
npm test             # Rodar testes
```

---

## 🎯 Regras de Ouro

### Antes de Commitar

```bash
# Sempre rode antes de commitar:
npm run lint:fix
npm run format
npm run type-check
npm run build
```

O Husky fará isso automaticamente, mas é bom garantir!

### Antes de Abrir PR

**Checklist:**

- [ ] Código segue o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)
- [ ] Funções com ≤ 20 linhas
- [ ] Sem `any` no TypeScript
- [ ] Testes escritos (se nova funcionalidade)
- [ ] Build passa sem erros
- [ ] Sem `console.log` ou `debugger`
- [ ] Screenshots/vídeo (se mudança de UI)
- [ ] Descrição clara do que foi feito e por quê

---

## 🏗️ Estrutura de Pastas (Resumida)

```
src/
├── app/                 # Páginas e rotas (Next.js App Router)
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # shadcn/ui components
│   └── ...
├── lib/                 # Utilitários e configurações
│   ├── supabase/       # Cliente Supabase
│   └── utils.ts        # Funções auxiliares
├── stores/              # Estado global (Zustand)
├── types/               # Tipos TypeScript
└── hooks/               # Custom hooks
```

**Convenção de nomenclatura:**

- Componentes: `PascalCase` (ex: `DealCard.tsx`)
- Hooks: `camelCase` com prefixo `use` (ex: `useDeals.ts`)
- Utilitários: `camelCase` (ex: `formatCurrency.ts`)
- Types: `PascalCase` (ex: `Deal`, `User`)

---

## 💡 Exemplos Práticos

### Criar Novo Componente

```tsx
// src/components/deals/deal-card.tsx
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
      <CardFooter>
        <Button onClick={() => onEdit(deal.id)}>Editar</Button>
        <Button variant="destructive" onClick={() => onDelete(deal.id)}>
          Deletar
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Criar Custom Hook

```tsx
// src/hooks/use-deals.ts
export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      const data = await fetchDeals();
      setDeals(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { deals, loading, error, reload: loadDeals };
}
```

### Usar no Componente

```tsx
// src/app/(dashboard)/crm/negocios/page.tsx
export default function DealsPage() {
  const { deals, loading, error } = useDeals();

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Negócios</h1>
      <div className="grid grid-cols-3 gap-4">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testes

### Exemplo de Teste Unitário

```typescript
// src/lib/utils.test.ts
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('should format BRL currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-100)).toBe('-R$ 100,00');
  });
});
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'next'"

```bash
# Solução: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: Supabase connection failed

```bash
# Solução: Verificar .env.local
# 1. Checar se as credenciais estão corretas
# 2. Verificar se o projeto Supabase está ativo
# 3. Tentar com as credenciais de um projeto novo
```

### Build falha com erros de TypeScript

```bash
# Solução: Verificar tipos
npm run type-check
# Corrigir os erros apontados
```

### Husky não roda no commit

```bash
# Solução: Reinstalar hooks
npm run prepare
```

---

## 📞 Suporte

**Problema técnico?**

1. Consulte a [documentação](README.md)
2. Procure em [Issues abertas](https://github.com/Eveneto/sistema_crm_simples/issues)
3. Abra uma [nova Issue](https://github.com/Eveneto/sistema_crm_simples/issues/new)

**Dúvidas sobre código?**

- Leia o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)
- Veja exemplos no código existente

**Dúvidas sobre processo?**

- Leia o [PLANEJAMENTO_SCRUM.md](PLANEJAMENTO_SCRUM.md)
- Consulte os [TEMPLATES_SCRUM.md](TEMPLATES_SCRUM.md)

---

## 🎓 Recursos de Aprendizado

### Next.js

- [Documentação Oficial](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Clean Code

- Livro: "Clean Code" - Robert C. Martin
- Livro: "Refactoring" - Martin Fowler
- Nosso guia: [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)

### Scrum

- [Scrum Guide](https://scrumguides.org/)
- Nosso guia: [PLANEJAMENTO_SCRUM.md](PLANEJAMENTO_SCRUM.md)

---

## ✅ Checklist do Primeiro Dia

Garanta que você:

- [ ] Clonou o repositório
- [ ] Instalou as dependências (`npm install`)
- [ ] Configurou `.env.local`
- [ ] Conseguiu rodar `npm run dev`
- [ ] Leu o [README.md](README.md)
- [ ] Leu o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)
- [ ] Configurou o Git (nome e e-mail)
- [ ] Testou fazer um commit (Husky rodou?)
- [ ] Entrou no Slack/Discord da equipe
- [ ] Se apresentou para o time
- [ ] Sabe qual User Story vai pegar primeiro

---

## 🚀 Está Pronto!

Agora você está preparado para desenvolver!

**Próximos passos:**

1. Escolha uma User Story do Sprint Backlog
2. Crie uma branch
3. Desenvolva seguindo Clean Code
4. Faça testes
5. Abra PR
6. Peça code review
7. Merge e celebre! 🎉

**Bem-vindo ao time! 👋**

---

> "O código é lido 10x mais do que é escrito. Escreva pensando em quem vai ler."  
> — Robert C. Martin

**Desenvolvido com ❤️ pela equipe CRM Simplificado**
