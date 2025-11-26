# 🧪 Guia de Testes

## Política de Testes

### ⚠️ **NÃO TESTADO = NÃO APROVADO**

Nenhum código pode ser considerado completo ou aprovado sem testes adequados. Esta é uma regra fundamental do projeto.

## Princípio KISS (Keep It Simple, Stupid)

Nossos testes seguem o princípio KISS:

- Testes simples e diretos
- Sem over-engineering
- Foco no essencial
- Fácil manutenção

## Stack de Testes

```bash
- Jest: Framework de testes
- React Testing Library: Testes de componentes React
- @testing-library/jest-dom: Matchers customizados
- @testing-library/user-event: Simulação de interações do usuário
```

## Estrutura de Arquivos

```
src/
├── app/
│   └── (auth)/
│       └── login/
│           ├── page.tsx
│           └── __tests__/
│               └── page.test.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       └── __tests__/
│           └── button.test.tsx
├── hooks/
│   ├── use-user-role.ts
│   └── __tests__/
│       └── use-user-role.test.ts
└── lib/
    └── auth/
        ├── roles.ts
        └── __tests__/
            └── roles.test.ts
```

## Comandos

```bash
# Executar todos os testes
npm test

# Executar em modo watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar em CI/CD
npm run test:ci
```

## Cobertura Mínima

- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

## Boas Práticas

### 1. Nomenclatura

```typescript
// ✅ BOM
describe('LoginPage', () => {
  it('deve renderizar o formulário de login', () => {
    // ...
  });
});

// ❌ RUIM
test('test1', () => {
  // ...
});
```

### 2. Arrange-Act-Assert (AAA)

```typescript
it('deve mostrar erro com e-mail inválido', async () => {
  // Arrange (Preparar)
  render(<LoginPage />);
  const emailInput = screen.getByLabelText(/e-mail/i);

  // Act (Agir)
  fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

  // Assert (Verificar)
  await waitFor(() => {
    expect(toast).toHaveBeenCalled();
  });
});
```

### 3. Teste o Comportamento, Não a Implementação

```typescript
// ✅ BOM - Testa o comportamento
it('deve desabilitar botão durante loading', () => {
  render(<LoginPage />);
  const button = screen.getByRole('button', { name: /entrar/i });
  fireEvent.click(button);
  expect(button).toBeDisabled();
});

// ❌ RUIM - Testa implementação interna
it('deve setar isLoading como true', () => {
  const { result } = renderHook(() => useState(false));
  expect(result.current[0]).toBe(false);
});
```

### 4. Use Queries Acessíveis

Ordem de prioridade:

1. `getByRole` - Melhor para acessibilidade
2. `getByLabelText` - Ótimo para formulários
3. `getByPlaceholderText` - Para inputs sem label
4. `getByText` - Para conteúdo estático
5. `getByTestId` - Último recurso

```typescript
// ✅ BOM
const button = screen.getByRole('button', { name: /entrar/i });
const input = screen.getByLabelText(/e-mail/i);

// ❌ RUIM
const button = screen.getByTestId('login-button');
```

### 5. Mocks Simples

```typescript
// ✅ BOM - Mock simples e direto
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// ❌ RUIM - Mock complexo desnecessário
jest.mock('@/hooks/use-toast', () => {
  const actual = jest.requireActual('@/hooks/use-toast');
  return {
    ...actual,
    useToast: () => {
      const mockToast = jest.fn();
      mockToast.mockImplementation((args) => {
        console.log('Toast called with:', args);
        return actual.useToast()(args);
      });
      return { toast: mockToast };
    },
  };
});
```

## Tipos de Testes

### Testes Unitários

Testam unidades individuais de código (funções, helpers, utils).

```typescript
// src/lib/auth/__tests__/roles.test.ts
describe('hasPermission', () => {
  it('admin deve ter todas as permissões', () => {
    expect(hasPermission('admin', 'canManageUsers')).toBe(true);
  });
});
```

### Testes de Integração

Testam a interação entre componentes.

```typescript
// src/app/(auth)/login/__tests__/page.test.tsx
it('deve fazer login com sucesso', async () => {
  render(<LoginPage />);

  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: 'user@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/senha/i), {
    target: { value: 'password123' }
  });
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

  await waitFor(() => {
    expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
  });
});
```

### Testes de Hooks

```typescript
// src/hooks/__tests__/use-user-role.test.ts
it('deve retornar role do usuário', async () => {
  const { result } = renderHook(() => useUserRole());

  await waitFor(() => {
    expect(result.current.role).toBe('admin');
  });
});
```

## Definition of Done (DoD)

Para considerar uma tarefa concluída, ela DEVE incluir:

- [ ] ✅ Código implementado
- [ ] ✅ Testes unitários escritos
- [ ] ✅ Testes de integração (se aplicável)
- [ ] ✅ Cobertura mínima atingida (60%)
- [ ] ✅ Todos os testes passando
- [ ] ✅ Code review aprovado
- [ ] ✅ Documentação atualizada

## Integração Contínua

Os testes são executados automaticamente:

- ✅ A cada commit (via Husky pre-commit hook)
- ✅ A cada pull request (via GitHub Actions)
- ✅ Antes do deploy (via CI/CD pipeline)

## Exemplos Práticos

### Testando Componente de Formulário

```typescript
describe('LoginForm', () => {
  it('deve validar campos obrigatórios', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/senha é obrigatória/i)).toBeInTheDocument();
  });
});
```

### Testando Custom Hook

```typescript
describe('useUserRole', () => {
  it('deve retornar isLoading como true inicialmente', () => {
    const { result } = renderHook(() => useUserRole());
    expect(result.current.isLoading).toBe(true);
  });
});
```

### Testando Função Utilitária

```typescript
describe('formatCurrency', () => {
  it('deve formatar valor em reais', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00');
  });
});
```

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Lembre-se: Não testado = Não aprovado! ⚠️**
