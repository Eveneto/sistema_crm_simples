# Correção: Editar Negócio (Edit Deal)

**Data:** 30 de novembro de 2025  
**Sprint:** Sprint 4  
**Tarefa:** US-040 Editar Negócio  

## Problema Relatado

1. A página de editar negócio aparece corretamente
2. Ao clicar em "Salvar Alterações", o negócio não é atualizado
3. Esperado: Ao salvar, voltar para o pipeline

## Diagnóstico

Foram identificados os seguintes problemas:

### 1. Type Mismatch na DealForm
**Arquivo:** `src/components/deals/deal-form.tsx`  
**Problema:** A interface `DealFormProps` definia `initialData` como `Deal` mas a página de edit passava `DealWithRelations`  
**Impacto:** Type safety issue (não causava erro em runtime, mas era incorreto)

**Solução:**
```typescript
// Antes
initialData?: Deal;

// Depois
initialData?: DealWithRelations;
```

### 2. Schema de Validação Incorreto
**Arquivo:** `src/components/deals/deal-form.tsx`  
**Problema:** O form sempre usava `createDealSchema` (com todos os campos obrigatórios) mesmo em modo `edit`  
**Impacto:** Validação poderia falhar em modo edit se algum campo opcional não fosse enviado

**Solução:**
- Importar ambos os schemas: `createDealSchema` e `updateDealSchema`
- Usar o schema correto baseado no mode:
```typescript
const schema = mode === 'edit' ? updateDealSchema : createDealSchema;
const form = useForm<any>({
  resolver: zodResolver(schema),
  // ...
});
```

### 3. Logging Melhorado para Debug
**Arquivo:** `src/components/deals/deal-form.tsx`  
**Melhoria:** Adicionado `console.log` detalhado no onSubmit para debug

```typescript
console.log('Deal Form Submit:', { mode, method, url, data, initialDataId: initialData?.id });
```

## Estrutura de API Implementada

### GET /api/deals/[id]
- Retorna detalhes de um negócio específico
- Requer autenticação
- Retorna: `{ deal: DealWithRelations }`

### PATCH /api/deals/[id]
- Atualiza um negócio existente
- Requer autenticação
- Valida dados com `updateDealSchema`
- Body: Qualquer campo de `UpdateDealInput`
- Retorna: `{ deal: DealWithRelations }`

### POST /api/deals
- Cria um novo negócio
- Requer autenticação
- Valida dados com `createDealSchema`
- Body: Todos os campos de `CreateDealInput`
- Retorna: `{ deal: DealWithRelations }`

## Fluxo de Edição Agora Funcionando

```
1. Usuário clica no botão "Edit" (ícone de lápis) no card do negócio
   ↓
2. Pipeline page chama handleEdit(deal)
   ↓
3. Router navega para /dashboard/deals/[id]
   ↓
4. Página de edit carrega o negócio via GET /api/deals/[id]
   ↓
5. DealForm renderiza em modo 'edit' com initialData preenchido
   ↓
6. Usuário edita os campos desejados
   ↓
7. Clica em "Salvar Alterações"
   ↓
8. Form valida com updateDealSchema (campos opcionais)
   ↓
9. Envia PATCH para /api/deals/[dealId]
   ↓
10. API atualiza e retorna deal atualizado
   ↓
11. Toast de sucesso aparece
   ↓
12. handleSuccess() redireciona para /dashboard/deals/pipeline
```

## Alterações Realizadas

### src/components/deals/deal-form.tsx
1. ✅ Importar `DealWithRelations` em vez de `Deal`
2. ✅ Importar `updateDealSchema` e `UpdateDealInput`
3. ✅ Atualizar tipo de `initialData` para `DealWithRelations`
4. ✅ Usar schema dinâmico baseado em mode
5. ✅ Adicionar logging detalhado no onSubmit

### src/app/(dashboard)/dashboard/deals/[id]/page.tsx
✅ Já implementado corretamente:
- Fetch de deal por ID
- Fetch de stages
- Renderização de DealForm em modo edit
- handleSuccess() que redireciona para pipeline

### src/app/api/deals/[id]/route.ts
✅ Já implementado corretamente:
- Endpoint PATCH para atualizar
- Validação de autenticação
- Verificação de propriedade do deal
- Validação com updateDealSchema

## Testes Recomendados

### 1. Teste Manual da UI
```bash
1. Ir para /dashboard/deals/pipeline (com usuário logado)
2. Passar o mouse sobre um card de negócio
3. Clicar no botão de editar (ícone de lápis)
4. Verificar se a página de edit abre
5. Editar um campo (ex: título ou valor)
6. Clicar em "Salvar Alterações"
7. Verificar se:
   - Toast de sucesso aparece
   - Página redireciona para pipeline
   - Mudança foi persistida (refresh e verifica)
```

### 2. Teste da API com curl
```bash
# Primeiro, obter um token de autenticação (feito automaticamente pelo navegador)
# Depois fazer requisição PATCH

curl -X PATCH http://localhost:3002/api/deals/{dealId} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo título",
    "value": 5000
  }'
```

### 3. Teste de Validação
- Tentar editar com título vazio (deve falhar)
- Tentar editar com valor negativo (deve falhar)
- Tentar editar apenas um campo (deve funcionar)
- Deixar campos em branco opcionais (deve funcionar)

### 4. Teste de Permissões
- Tentar editar um deal de outro usuário (deve retornar 403)
- Tentar editar um deal inexistente (deve retornar 404)

## Status

✅ **Código implementado**  
⏳ **Aguardando teste manual**  
⏳ **Aguardando feedback do usuário**

## Próximas Etapas

1. ✅ Implementar US-040: Editar Negócio
2. ⏳ Testar fluxo completo de edit
3. ⏳ Implementar US-042: Detalhes de Negócio (opcional, pode ser a página de edit reaproveitada)
4. ⏳ Implementar US-047: Filtros e Busca
5. ⏳ Implementar US-046: Dashboard de Métricas

## Referências

- **Pipeline Page:** `src/app/(dashboard)/dashboard/deals/pipeline/page.tsx`
- **Edit Page:** `src/app/(dashboard)/dashboard/deals/[id]/page.tsx`
- **Deal Form:** `src/components/deals/deal-form.tsx`
- **API GET/PATCH:** `src/app/api/deals/[id]/route.ts`
- **Schemas:** `src/lib/validations/deal.ts`
- **Types:** `src/types/deal.ts`
