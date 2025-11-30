# 💬 Criar Conversas - Nova Feature

## 📋 Resumo

Implementada a funcionalidade de **criar novas conversas** com contatos. Agora você pode:

1. ✅ Clicar em "Nova Conversa" na página de conversas
2. ✅ Selecionar um contato da lista de contatos disponíveis
3. ✅ A conversa é criada e atribuída automaticamente a você
4. ✅ A conversa aparece na lista e fica selecionada automaticamente

## 🎯 Como Usar

### 1. Acessar a Página de Conversas
```
http://localhost:3000/dashboard/conversations
```

### 2. Clicar em "Nova Conversa"
- Botão localizado no canto superior direito do header
- Ícone: Plus (+)

### 3. Selecionar um Contato
- Dialog abre com dropdown de contatos
- Contatos disponíveis:
  - João Silva
  - Maria Santos
  - Pedro Oliveira
  - Ana Costa
  - Beatriz Cardoso
  - E outros...

### 4. Confirmar
- Clique em "Criar Conversa"
- Conversa é criada e você é automaticamente levado para ela
- Pode começar a enviar mensagens

## 🏗️ Implementação

### API - POST `/api/conversations/create`

**Request:**
```json
{
  "contact_id": "uuid-do-contato",
  "channel_id": "whatsapp"  // opcional
}
```

**Response (201 - Criada):**
```json
{
  "message": "Conversa criada com sucesso",
  "conversation": {
    "id": "uuid-conversa",
    "contact_id": "uuid-contato",
    "channel_id": "whatsapp",
    "assigned_to": "seu-uuid",
    "status": "open",
    "created_at": "2025-11-30T..."
  }
}
```

**Response (200 - Já Existe):**
```json
{
  "message": "Conversa já existe",
  "conversation": {
    "id": "uuid-conversa"
  }
}
```

### Componentes

#### 1. CreateConversationDialog
**Arquivo:** `src/components/chat/create-conversation-dialog.tsx`

Dialog modal que permite criar conversa:
- Recebe lista de contatos como props
- Callback quando conversa é criada
- Validações:
  - Contato obrigatório
  - Feedback via toast
  - Loading state

#### 2. Página Conversas Atualizada
**Arquivo:** `src/app/(dashboard)/dashboard/conversations/page.tsx`

Atualizações:
- Carrega contatos ao inicializar
- Passa contatos para CreateConversationDialog
- Callback para reload de conversas
- Auto-seleciona nova conversa

### Banco de Dados

Tabela `conversations`:
- `id` (uuid, PK)
- `contact_id` (uuid, FK)
- `channel_id` (varchar, default: 'whatsapp')
- `assigned_to` (uuid, FK → auth.users) ✅ Preenchido automaticamente
- `status` (varchar, default: 'open')
- `unread_count` (int, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## ✅ Testes Manuais

### Teste 1: Criar Conversa Simples
```
1. Acesse /dashboard/conversations
2. Clique "Nova Conversa"
3. Selecione "João Silva"
4. Clique "Criar Conversa"
5. ✅ Conversa deve aparecer na sidebar
6. ✅ Deve estar selecionada
7. ✅ Pode enviar mensagens
```

### Teste 2: Conversa Já Existe
```
1. Crie conversa com "João Silva"
2. Tente criar novamente com "João Silva"
3. ✅ Deve retornar conversa existente
4. ✅ Não deve duplicar
```

### Teste 3: Múltiplas Conversas
```
1. Crie conversa com "João Silva"
2. Crie conversa com "Maria Santos"
3. Crie conversa com "Pedro Oliveira"
4. ✅ Todas aparecem na sidebar
5. ✅ Pode navegar entre elas
```

### Teste 4: Validação
```
1. Clique "Nova Conversa"
2. Tente clicar "Criar Conversa" sem selecionar
3. ✅ Deve aparecer toast "Selecione um contato"
4. ✅ Botão deve estar disabled
```

## 📊 Status

| Item | Status |
|------|--------|
| API POST /api/conversations/create | ✅ Completa |
| Dialog component | ✅ Completa |
| Página integrada | ✅ Completa |
| Build | ✅ PASSED |
| Testes manuais | 🔄 Pronto para testar |

## 🚀 Próximos Passos

1. **Agora:** Use a feature para criar conversas
2. **Próximo:** Implementar edição de conversas (renomear, reabrir arquivadas)
3. **Depois:** Implementar notificações em tempo real
4. **Futuro:** Integração com WhatsApp real

## 🐛 Se Tiver Problemas

### Erro: "Contato não encontrado"
- Certifique-se que o contato existe
- Verifique o ID do contato no banco

### Erro: "Não autenticado"
- Faça login novamente
- Verifique autenticação no console

### Conversa não aparece após criação
- Recarregue a página (`F5`)
- Verifique `assigned_to` tem seu ID de usuário

## 📝 Notas Técnicas

- Conversa é criada com `status = 'open'`
- `assigned_to` é preenchido com ID do usuário logado
- `channel_id` padrão é 'whatsapp'
- Se conversa já existe para o contato+canal, retorna a existente
- Toast feedback para sucesso e erro
