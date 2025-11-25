# Guia de Contribuição

Obrigado por considerar contribuir com o CRM Simplificado! 🎉

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone o seu fork
git clone https://github.com/seu-usuario/sistema_crm_simples.git
cd sistema_crm_simples

# Adicione o repositório original como upstream
git remote add upstream https://github.com/Eveneto/sistema_crm_simples.git
```

### 2. Crie uma Branch

```bash
# Sempre crie uma branch a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/nome-da-funcionalidade
```

**Convenção de nomes de branch:**

- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Alterações em documentação
- `refactor/` - Refatoração de código
- `test/` - Adição ou correção de testes
- `chore/` - Tarefas de manutenção

### 3. Desenvolva

Siga **rigorosamente** o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md):

- ✅ Funções com ≤ 20 linhas
- ✅ Nomes descritivos (sem abreviações)
- ✅ TypeScript strict (sem `any`)
- ✅ Comentários explicam POR QUÊ, não O QUÊ
- ✅ Testes para novas funcionalidades

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(crm): adiciona filtro de negócios por status"
git commit -m "fix(chat): corrige scroll automático no chat"
git commit -m "docs: atualiza guia de instalação"
```

**Tipos de commit:**

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (não afeta lógica)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção
- `perf:` - Performance

### 5. Push e Pull Request

```bash
git push origin feature/nome-da-funcionalidade
```

Abra um Pull Request com:

**Título:** tipo(escopo): descrição curta

```
feat(kanban): adiciona drag and drop de deals
```

**Descrição:**

```markdown
## O que foi feito

Implementação do drag and drop no kanban de negócios usando @dnd-kit.

## Por quê

Facilitar a movimentação de deals entre os estágios do pipeline.

## Como testar

1. Acesse a página de Negócios
2. Arraste um deal para outro estágio
3. Verifique que a posição foi salva no banco

## Screenshots

[Adicione screenshots/GIFs se for UI]

## Checklist

- [x] Código segue o CODE_REVIEW_GUIDE.md
- [x] Testes adicionados/atualizados
- [x] Documentação atualizada
- [x] Sem `console.log` ou `debugger`
- [x] Build passa sem erros
- [x] Lint passa sem warnings
```

## Padrões de Código

### TypeScript

```typescript
// ✅ BOM
interface CreateDealInput {
  title: string;
  contact_id: string;
  value: number;
}

function createDeal(data: CreateDealInput): Promise<Deal> {
  // implementação
}

// ❌ RUIM
function createDeal(data: any) {
  // implementação
}
```

### React Components

```typescript
// ✅ BOM - Componente pequeno, tipado, single responsibility
interface DealCardProps {
  deal: Deal;
  onEdit: (id: string) => void;
}

export function DealCard({ deal, onEdit }: DealCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{formatCurrency(deal.value)}</p>
        <Button onClick={() => onEdit(deal.id)}>Editar</Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Hooks

```typescript
// ✅ BOM - Lógica separada, reutilizável
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

## Testes

```bash
# Rodar testes
npm test

# Testes em watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## Code Review

Todo PR passa por code review seguindo o checklist do [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md).

**Tempo de resposta:**

- Reviewer: até 24h para revisar
- Autor: até 48h para corrigir

**Tipos de comentários:**

- 🔴 **BLOQUEANTE:** Deve ser corrigido antes do merge
- 🟡 **Sugestão:** Melhoria não-obrigatória (prefixo `nit:`)
- ✅ **Aprovado:** LGTM (Looks Good To Me)

## Ferramentas

Antes de abrir o PR, rode:

```bash
npm run lint        # Verificar erros
npm run lint:fix    # Corrigir automaticamente
npm run format      # Formatar código
npm run type-check  # Verificar tipos TypeScript
npm run build       # Testar build
```

## Dúvidas?

- 📖 Leia o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)
- 📋 Consulte o [PLANEJAMENTO_TECNICO.md](PLANEJAMENTO_TECNICO.md)
- 🛠️ Veja o [SETUP.md](SETUP.md)
- ❓ Abra uma [Issue](https://github.com/Eveneto/sistema_crm_simples/issues)

## Código de Conduta

- Seja respeitoso e profissional
- Foque no código, não na pessoa
- Aceite críticas construtivas
- Ajude outros desenvolvedores

---

**Obrigado por contribuir! 🚀**
