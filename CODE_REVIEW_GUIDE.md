# Guia Completo de Clean Code e Code Review

Para programadores que desejam entregar código profissional, legível, mantível e com baixa dívida técnica

## 1. Princípios Fundamentais de Clean Code

Baseados nos maiores autores da engenharia de software:

| Autor / Livro                        | Princípio chave                                                                                                                                      | Aplicação prática no dia a dia                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Robert C. Martin – Clean Code (2008) | Código deve ser lido como prosa em inglês                                                                                                            | Nomes significativos, funções curtas, uma responsabilidade por função |
| SOLID (Robert Martin)                | **S** – Single Responsibility<br>**O** – Open/Closed<br>**L** – Liskov Substitution<br>**I** – Interface Segregation<br>**D** – Dependency Inversion | Base de toda arquitetura saudável                                     |
| Kent Beck                            | "Make it work → Make it right → Make it fast" (em ordem)                                                                                             | Primeiro funcional, depois refatorar, por último otimizar             |
| Sandi Metz                           | "Prefer duplication over the wrong abstraction"                                                                                                      | Não crie abstrações prematuras                                        |
| Martin Fowler                        | Refactoring constante + "Code smells"                                                                                                                | Identificar e eliminar cheiros de código                              |

---

## 2. Regras Práticas de Clean Code

### 2.1 Nomenclatura (70% da legibilidade)

Use nomes que revelam intenção (nunca `i`, `temp`, `data`):

```typescript
// ❌ RUIM
const d = 7;
function handleClick() {}

// ✅ BOM
const deliveryDays = 7;
function handleSubmitContactForm() {}
```

**Regras de nomenclatura:**

- **Classes/Types** → Substantivo: `Customer`, `Invoice`, `ContactFormData`
- **Funções** → Verbo ou frase verbal: `sendWelcomeEmail()`, `isOverdue()`, `calculateTotal()`
- **Booleanos** → prefixo `is`, `has`, `can`, `should`: `isActive`, `hasPermission`, `canEdit`, `shouldShowModal`
- Use pronúncia fácil e buscável (evite abreviações obscuras)

```typescript
// ❌ RUIM
const usrMgr = new UserManager();
const fn = () => {};

// ✅ BOM
const userManager = new UserManager();
const formatCustomerName = () => {};
```

---

### 2.2 Tamanho e Responsabilidade

- **Função ≤ 20 linhas** (ideal ≤ 10)
- **Máximo 3-4 parâmetros** (4+ → crie objeto de opções)
- **Faça apenas UMA coisa** (Single Responsibility Principle)
- **Nível de abstração consistente** dentro da função

```typescript
// ❌ RUIM - Faz muitas coisas
function processOrder(order: Order) {
  // valida
  if (!order.items.length) throw new Error('Empty order');

  // calcula
  const total = order.items.reduce((sum, item) => sum + item.price, 0);

  // salva no banco
  db.orders.save({ ...order, total });

  // envia email
  sendEmail(order.customer.email, 'Order confirmed');

  // atualiza estoque
  order.items.forEach((item) => updateStock(item.id, -item.quantity));
}

// ✅ BOM - Cada função faz uma coisa
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateOrderTotal(order);
  const savedOrder = saveOrder(order, total);
  notifyCustomer(savedOrder);
  updateInventory(order.items);
}
```

---

### 2.3 Estrutura e Formatação

- **Máximo 100-120 caracteres por linha**
- **1 nível de indentação** por função quando possível
- **Early return** (guard clauses) em vez de if aninhado
- **Prefira `const` → `let` → nunca `var`**
- **Prefira destructuring e spread** em vez de manipulação manual

```typescript
// ❌ RUIM - If aninhado
function getDiscount(user: User, order: Order) {
  if (user) {
    if (user.isPremium) {
      if (order.total > 100) {
        return order.total * 0.2;
      } else {
        return order.total * 0.1;
      }
    } else {
      return 0;
    }
  }
  return 0;
}

// ✅ BOM - Early return
function getDiscount(user: User, order: Order): number {
  if (!user || !user.isPremium) return 0;

  return order.total > 100 ? order.total * 0.2 : order.total * 0.1;
}
```

---

### 2.4 Componentes React / Next.js

**Regras específicas para componentes:**

- **Componente ≤ 200 linhas** (divida se maior)
- **Extraia lógica complexa para custom hooks**
- **Prefira componentes funcionais + hooks**
- **Coloque loading e error states no nível mais baixo possível**
- **Use `useMemo`/`useCallback` apenas quando comprovadamente necessário** (evite excesso)

```tsx
// ❌ RUIM - Componente fazendo tudo
function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => c.name.includes(filter));

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {loading ? <Spinner /> : filtered.map((c) => <CustomerCard key={c.id} customer={c} />)}
    </div>
  );
}

// ✅ BOM - Separado em hook customizado
function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { customers, loading, error, reload: loadCustomers };
}

function CustomerList() {
  const { customers, loading, error } = useCustomers();
  const [filter, setFilter] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <Spinner />;

  return (
    <div>
      <SearchInput value={filter} onChange={setFilter} />
      <CustomerGrid customers={filteredCustomers} />
    </div>
  );
}
```

---

### 2.5 Tratamento de Erros

- **Nunca engula erros silenciosamente**
- **Use erros customizados com contexto**
- **Nunca retorne `null` ou `undefined`** para indicar erro em funções normais (prefira Result/Either pattern ou throw)

```typescript
// ❌ RUIM
async function createCustomer(data: any) {
  try {
    const customer = await db.customers.create(data);
    return customer;
  } catch (error) {
    console.log(error); // Engole o erro
    return null; // Retorna null
  }
}

// ✅ BOM
class CustomerCreationError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'CustomerCreationError';
  }
}

async function createCustomer(data: CustomerInput): Promise<Customer> {
  try {
    validateCustomerData(data);
    const customer = await db.customers.create(data);
    return customer;
  } catch (error) {
    throw new CustomerCreationError(`Failed to create customer: ${data.email}`, error as Error);
  }
}
```

---

### 2.6 Comentários

- **Bom comentário:** POR QUÊ, não O QUÊ
- **Prefira código autoexplicativo a comentários**

```typescript
// ❌ RUIM
// incrementa i
i++;

// soma os valores
const total = a + b + c;

// ✅ BOM
// Workaround para bug do Safari 15 que ignora o último item da lista
// Ref: https://bugs.webkit.org/show_bug.cgi?id=234567
items.push({ id: 'dummy', visible: false });

// Aguarda 100ms antes de retentar para evitar rate limiting da API
await sleep(100);
```

---

## 3. Checklist de Code Review

Use em **todo Pull Request**:

### Estrutura geral do PR

- [ ] Título descritivo + referência a ticket (ex: `feat(crm): adiciona kanban de negócios #123`)
- [ ] Descrição clara: o que foi feito, por quê, como testar
- [ ] Tamanho do PR ≤ 400 linhas (ideal ≤ 250)
- [ ] Screenshots/vídeo se for mudança de UI

### Clean Code

- [ ] Nomes de variáveis, funções e componentes são claros e consistentes
- [ ] Funções têm ≤ 20 linhas e uma única responsabilidade
- [ ] Não há duplicação de código (> 8 linhas iguais)
- [ ] Não há lógica complexa no JSX (extraia para hooks ou utils)
- [ ] Early returns usados (evita if aninhado)
- [ ] Não há `console.log` ou `debugger` em código de produção
- [ ] Erros são tratados adequadamente (try/catch, loading, error boundary)

### TypeScript

- [ ] Tipagem forte (evite `any`, `unknown` só quando inevitável)
- [ ] Interfaces/types bem nomeadas e reutilizáveis
- [ ] Não há `!` (non-null assertion) desnecessário
- [ ] Props de componentes estão tipadas

### Segurança e Performance

- [ ] Variáveis sensíveis (tokens, API keys) estão no `.env`
- [ ] Não há chaves ou senhas hard-coded
- [ ] Imagens e assets otimizados
- [ ] Queries SQL parametrizadas (se usar raw SQL)
- [ ] Não há queries N+1 (banco de dados)

### Testes ⚠️ **NÃO TESTADO = NÃO APROVADO**

- [ ] **Política obrigatória**: Todo código novo tem testes
- [ ] Testes unitários para funções e utils
- [ ] Testes de integração para componentes React
- [ ] Testes de hooks customizados
- [ ] Cobertura mínima de 60% atingida (branches, functions, lines, statements)
- [ ] Todos os testes estão passando (`npm test`)
- [ ] Testes seguem o princípio AAA (Arrange-Act-Assert)
- [ ] Nomes de testes descritivos (`deve renderizar formulário`, não `test1`)
- [ ] Mocks simples e diretos (princípio KISS)
- [ ] Queries acessíveis (`getByRole`, `getByLabelText` > `getByTestId`)

### UI/UX

- [ ] Responsivo (mobile first)
- [ ] Acessibilidade básica (alt em imagens, labels em inputs, contraste)
- [ ] Feedback visual (loading, toast de sucesso/erro)
- [ ] Estados vazios tratados (empty state)

---

## 4. Code Smells Mais Comuns

Detecte e corrija rapidamente:

| Smell                        | Como identificar                      | Como corrigir                    |
| ---------------------------- | ------------------------------------- | -------------------------------- |
| **Função grande**            | > 30 linhas                           | Extrair funções menores          |
| **Parâmetro booleano**       | `sendEmail(user, true)`               | Criar duas funções específicas   |
| **Duplicação**               | Mesmo bloco em 3+ lugares             | Extrair função/componente        |
| **Feature Envy**             | Método usa mais dados de outra classe | Mover método para a classe certa |
| **Long Parameter List**      | Função com 5+ parâmetros              | Criar objeto de configuração     |
| **Magic numbers/strings**    | `if (status === 3)`                   | Criar enum ou constante nomeada  |
| **Comentário desnecessário** | Comenta o óbvio                       | Remover e melhorar nomes         |
| **Código morto**             | Código comentado ou nunca usado       | Deletar (está no git)            |

### Exemplos práticos:

```typescript
// ❌ SMELL: Magic numbers
if (user.role === 2) {
  // admin
}

// ✅ CORREÇÃO: Use enum
enum UserRole {
  USER = 1,
  ADMIN = 2,
  MANAGER = 3,
}

if (user.role === UserRole.ADMIN) {
  // admin
}
```

```typescript
// ❌ SMELL: Long parameter list
function createOrder(
  customerId: string,
  items: Item[],
  shippingAddress: string,
  billingAddress: string,
  paymentMethod: string,
  discount: number,
  notes: string
) {}

// ✅ CORREÇÃO: Objeto de configuração
interface CreateOrderParams {
  customerId: string;
  items: Item[];
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  discount?: number;
  notes?: string;
}

function createOrder(params: CreateOrderParams) {}
```

---

## 5. Processo Recomendado de Code Review

### Fluxo de trabalho:

1. **Autor** marca PR como "Ready for Review" + adiciona screenshots/vídeo se for UI
2. **Pelo menos 1 aprovador** (2 se for código crítico ou mudança de arquitetura)
3. **Revisores têm até 24h para revisar** (ideal 4h)
4. **Comentários devem ser categorizados:**
   - 🔴 **Obrigatórios:** bloqueiam merge (segurança, bug, quebra de contrato)
   - 🟡 **Sugestões:** `nit:` ou `opcional:` (melhorias não-bloqueantes)
5. **Autor responde TODOS os comentários** (mesmo que seja "ok, corrigido")
6. Após correções, **autor solicita novo review** ou marca como resolvido
7. **Merge apenas com:**
   - ✅ Aprovação de todos os revisores
   - ✅ Testes passando (CI/CD)
   - ✅ Sem conflitos

### Exemplos de comentários de review:

```
🔴 BLOQUEANTE: Esta query SQL está vulnerável a SQL injection.
Use prepared statements.

🟡 nit: Considere extrair esta lógica para um hook customizado
para melhorar a reutilização.

✅ LGTM! (Looks Good To Me) Ótima abstração do hook de autenticação.
```

---

## 6. Ferramentas Recomendadas

### Linting e Formatação

```bash
# Instalar
npm install -D eslint prettier eslint-config-next eslint-config-prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Configurar .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}

# Configurar .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

### Git Hooks (Husky + lint-staged)

```bash
npm install -D husky lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}

# Rodar antes de cada commit
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Análise Estática

- **SonarQube** ou **CodeClimate** (análise de qualidade, cobertura, vulnerabilidades)
- **Snyk** (vulnerabilidades em dependências)

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 7. Métricas de Qualidade

### Como medir se o código está limpo:

| Métrica                      | Valor ideal       | Como medir                        |
| ---------------------------- | ----------------- | --------------------------------- |
| **Complexidade ciclomática** | ≤ 10 por função   | SonarQube, ESLint complexity rule |
| **Cobertura de testes**      | ≥ 80%             | Jest coverage report              |
| **Duplicação de código**     | ≤ 3%              | SonarQube, jscpd                  |
| **Dívida técnica**           | ≤ 5% do tempo dev | SonarQube technical debt ratio    |
| **Tempo de review**          | ≤ 24h             | GitHub/GitLab analytics           |
| **Tamanho do PR**            | ≤ 400 linhas      | GitHub/GitLab PR stats            |

---

## 8. Exemplos Práticos de Refatoração

### Antes e Depois

#### Exemplo 1: Componente React complexo

```tsx
// ❌ ANTES - Tudo misturado
function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/deals')
      .then((r) => r.json())
      .then((d) => {
        setDeals(d);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">Todos</option>
        <option value="open">Abertos</option>
        <option value="won">Ganhos</option>
      </select>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div>
          {deals
            .filter((d) => filter === 'all' || d.status === filter)
            .map((d) => (
              <div key={d.id}>
                <h3>{d.title}</h3>
                <p>{d.value}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ✅ DEPOIS - Separado e limpo
// hooks/useDeals.ts
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

// components/DealFilter.tsx
interface DealFilterProps {
  value: DealStatus;
  onChange: (status: DealStatus) => void;
}

export function DealFilter({ value, onChange }: DealFilterProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as DealStatus)}>
      <option value="all">Todos</option>
      <option value="open">Abertos</option>
      <option value="won">Ganhos</option>
    </select>
  );
}

// components/DealCard.tsx
interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <div className="deal-card">
      <h3>{deal.title}</h3>
      <p>{formatCurrency(deal.value)}</p>
    </div>
  );
}

// pages/Dashboard.tsx
export function Dashboard() {
  const { deals, loading, error } = useDeals();
  const [filter, setFilter] = useState<DealStatus>('all');

  const filteredDeals = useFilteredDeals(deals, filter);

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <DealFilter value={filter} onChange={setFilter} />
      <DealList deals={filteredDeals} />
    </div>
  );
}
```

---

## 9. Regras de Ouro (imprima e cole na parede)

1. ✅ **"Se você precisa comentar, refatore o código para ser autoexplicativo"**
2. ✅ **"Deixe o código mais limpo do que você encontrou"** (Boy Scout Rule)
3. ✅ **"Duplicação é melhor que a abstração errada"**
4. ✅ **"Faça funcionar, depois faça certo, depois faça rápido"**
5. ✅ **"Um PR por dia mantém o revisor saudável"** (PRs pequenos)
6. ✅ **"Se não tem teste, não está pronto"**
7. ✅ **"O código é lido 10x mais do que escrito"**
8. ✅ **"Early return é seu amigo"**
9. ✅ **"Nome ruim = código ruim"**
10. ✅ **"Todo dia é dia de refatorar"**

---

## 10. Conclusão

**Código limpo não é luxo — é requisito de produto profissional.**

Quem segue rigorosamente este guia reduz em até **70% o tempo de manutenção** e **onboarding de novos desenvolvedores**.

### Compromisso da equipe:

- [ ] Todo PR segue o checklist de code review
- [ ] Todo código novo tem pelo menos 1 aprovação
- [ ] Nenhum PR é mergeado com testes falhando
- [ ] Code smells são refatorados imediatamente
- [ ] Dívida técnica é documentada e priorizada

---

## Referências

- 📚 **Clean Code** - Robert C. Martin (Uncle Bob)
- 📚 **Refactoring** - Martin Fowler
- 📚 **The Pragmatic Programmer** - Andrew Hunt & David Thomas
- 📚 **Practical Object-Oriented Design in Ruby** - Sandi Metz
- 🔗 [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- 🔗 [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

**Última atualização:** 25 de novembro de 2025  
**Versão:** 1.0.0

_Mantenha este guia vivo: proponha melhorias via PR!_
