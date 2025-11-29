# Guia de Refinamento de Mocks - Supabase

## 🎯 Objetivo

Este guia mostra como refinar os mocks do Supabase para fazer todos os testes assíncronos passarem.

---

## ❌ Problema Atual

```typescript
// Mock simplificado que não funciona corretamente
const createMockSupabase = (mockData: any = {}) => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    // ...
    then: jest.fn((resolve) => resolve({ data: mockData.data || [], error: mockData.error || null })),
  };

  return {
    from: jest.fn(() => mockChain),
  } as unknown as SupabaseClient;
};
```

**Por que falha:**
- A função espera `await` mas o mock usa `.then()`
- O retorno não é uma Promise válida
- A estrutura não corresponde ao comportamento real do Supabase

---

## ✅ Solução 1: Mock com Promise Real

```typescript
const createMockSupabase = (mockData: any = {}) => {
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockData.data || [],
        error: mockData.error || null,
      }),
    })),
  } as unknown as SupabaseClient;
};
```

**Mudanças:**
- Usa `.mockResolvedValue()` ao invés de `.then()`
- Retorna Promise que resolve para `{ data, error }`
- Último método da chain retorna Promise

---

## ✅ Solução 2: Mock Específico por Teste

```typescript
it('deve retornar receita realizada do período atual', async () => {
  // Arrange
  const userId = 'user-123';
  const dateRange = {
    startDate: '2024-11-01T00:00:00.000Z',
    endDate: '2024-11-30T23:59:59.999Z',
  };
  
  const mockDeals = [
    { value: 50000, status: 'won', closed_at: '2024-11-15T00:00:00.000Z' },
    { value: 30000, status: 'won', closed_at: '2024-11-20T00:00:00.000Z' },
  ];

  // Mock específico para este teste
  const mockFrom = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    not: jest.fn().mockResolvedValue({
      data: mockDeals,
      error: null,
    }),
  });

  const supabase = { from: mockFrom } as unknown as SupabaseClient;

  // Act
  const result = await fetchRealizedRevenue(supabase, userId, dateRange);

  // Assert
  expect(result.current).toBe(80000);
  expect(mockFrom).toHaveBeenCalledWith('deals');
});
```

---

## ✅ Solução 3: Mock Builder Pattern

```typescript
class SupabaseMockBuilder {
  private mockData: any[] = [];
  private mockError: any = null;

  withData(data: any[]) {
    this.mockData = data;
    return this;
  }

  withError(error: any) {
    this.mockError = error;
    return this;
  }

  build(): SupabaseClient {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: this.mockData,
        error: this.mockError,
      }),
    };

    return {
      from: jest.fn(() => chain),
    } as unknown as SupabaseClient;
  }
}

// Uso
it('deve retornar receita realizada', async () => {
  const mockDeals = [
    { value: 50000, status: 'won' },
    { value: 30000, status: 'won' },
  ];

  const supabase = new SupabaseMockBuilder()
    .withData(mockDeals)
    .build();

  const result = await fetchRealizedRevenue(supabase, userId, dateRange);
  
  expect(result.current).toBe(80000);
});
```

---

## ✅ Solução 4: Mock Múltiplas Chamadas

```typescript
it('deve calcular comparação com período anterior', async () => {
  // Arrange
  const currentDeals = [{ value: 80000, status: 'won', closed_at: '2024-11-15' }];
  const previousDeals = [{ value: 50000, status: 'won', closed_at: '2024-10-15' }];

  // Mock para múltiplas chamadas
  const mockFrom = jest.fn()
    // Primeira chamada (período atual)
    .mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue({
        data: currentDeals,
        error: null,
      }),
    })
    // Segunda chamada (período anterior)
    .mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue({
        data: previousDeals,
        error: null,
      }),
    });

  const supabase = { from: mockFrom } as unknown as SupabaseClient;

  // Act
  const result = await fetchRealizedRevenue(supabase, userId, dateRange);

  // Assert
  expect(result.current).toBe(80000);
  expect(result.previous).toBe(50000);
  expect(result.trend).toBe('up');
  expect(result.percentChange).toBeCloseTo(60, 0); // (80000-50000)/50000 * 100
});
```

---

## 🔧 Exemplo de Refatoração Completa

### Antes (❌ Não Funciona)
```typescript
describe('fetchRealizedRevenue', () => {
  it('deve retornar receita realizada', async () => {
    const mockDeals = [mockWonDeal({ value: 50000 })];
    const supabase = createMockSupabase({ data: mockDeals });

    const result = await fetchRealizedRevenue(supabase, userId, dateRange);
    
    expect(result.current).toBe(50000); // ❌ FALHA: undefined
  });
});
```

### Depois (✅ Funciona)
```typescript
describe('fetchRealizedRevenue', () => {
  it('deve retornar receita realizada', async () => {
    // Arrange
    const mockDeals = [
      { id: '1', value: 30000, status: 'won', closed_at: '2024-11-10' },
      { id: '2', value: 20000, status: 'won', closed_at: '2024-11-20' },
    ];

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue({ data: mockDeals, error: null }),
    };

    const supabase = {
      from: jest.fn(() => mockQuery),
    } as unknown as SupabaseClient;

    // Act
    const result = await fetchRealizedRevenue(supabase, userId, dateRange);

    // Assert
    expect(result.current).toBe(50000); // ✅ PASSA
    expect(result.trend).toBeDefined();
  });
});
```

---

## 🎯 Checklist de Correção

Para cada teste falhando, verifique:

- [ ] Mock retorna Promise com `.mockResolvedValue()`
- [ ] Último método da chain é que resolve a Promise
- [ ] Estrutura de resposta: `{ data: [...], error: null }`
- [ ] Múltiplas chamadas usam `.mockReturnValueOnce()`
- [ ] Mock corresponde à sequência real de métodos
- [ ] Dados do mock correspondem ao tipo esperado

---

## 📚 Exemplo Completo para Copy-Paste

```typescript
// helpers/supabase-mock.ts
export class SupabaseMock {
  static createClient(responses: any[] = []) {
    let callIndex = 0;

    const createChain = () => {
      const response = responses[callIndex] || { data: [], error: null };
      callIndex++;

      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(response),
      };
    };

    return {
      from: jest.fn(() => createChain()),
    } as unknown as SupabaseClient;
  }

  static singleQuery(data: any[], error: any = null) {
    return { data, error };
  }
}

// Uso nos testes
it('deve funcionar com mock melhorado', async () => {
  const supabase = SupabaseMock.createClient([
    SupabaseMock.singleQuery([{ value: 50000 }]), // primeira query
    SupabaseMock.singleQuery([{ value: 30000 }]), // segunda query
  ]);

  const result = await fetchRealizedRevenue(supabase, userId, dateRange);
  
  expect(result.current).toBe(50000);
  expect(result.previous).toBe(30000);
});
```

---

## 🚀 Próximos Passos

1. **Aplicar Solução 1** em `createMockSupabase()`
2. **Executar testes:** `npm test analyticsService`
3. **Verificar 30/30 passando**
4. **Aplicar nos outros arquivos de teste**
5. **Executar suite completa:** `npm test`

---

## 📖 Referências

- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Testing Async Code](https://jestjs.io/docs/asynchronous)

---

**Status:** 📝 Guia Completo  
**Aplicação:** Pendente  
**Resultado Esperado:** 100% dos testes passando
