# 🐛 FIX: Dupla Submissão de Mensagem

## 🔍 Problema Encontrado

**Erro:**
```
[DEBUG] Validation error: [
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'content' ],
    message: 'Invalid input: expected string, received object'
  }
]
```

**Comportamento:**
- Usuário digita mensagem
- Clica "Enviar"
- Primeira submissão: ✅ Sucesso
- Segunda submissão automática: ❌ Erro (content é objeto, não string)
- Resultado: Mensagem duplicada ou erro

## 🔎 Causa Raiz

### Fluxo Quebrado

```
MessageInput
  ├─ POST /api/messages { content: "Texto" }
  │  └─ API retorna: { id, content: "Texto", ... }  (Message object)
  │
  └─ Chama onMessageSent(message_object)
     │
     └─ ConversationsPage.handleSendMessage(message_object)
        │
        ├─ POST /api/messages { content: message_object }  ❌ ERRADO!
        │  └─ Validação falha: content deve ser string
        │
        └─ Erro: Expected string, received object
```

## ✅ Solução Implementada

### Novo Fluxo Correto

```
MessageInput
  ├─ POST /api/messages { content: "Texto" }
  │  └─ API retorna: { id, content: "Texto", ... }
  │
  └─ Chama onMessageSent(message_object)
     │
     └─ ConversationsPage.handleSendMessage(message_object)
        │
        ├─ Apenas adiciona ao estado local
        │  (NÃO faz POST novamente!)
        │
        └─ Renderiza na UI
           └─ ✅ Mensagem aparece
```

### Código Alterado

#### Antes (❌)
```typescript
// ConversationsPage
const handleSendMessage = async (content: string) => {
  // Tenta enviar NOVAMENTE para API
  const response = await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: selectedId,
      content  // ← Era uma string aqui
    })
  });
  
  const newMessage = await response.json();
  setMessages((prev) => [...prev, newMessage]);
};

// MessageInput chama:
if (onMessageSent) {
  onMessageSent(message);  // ← Passa objeto, não string!
}
```

#### Depois (✅)
```typescript
// ConversationsPage
const handleSendMessage = async (message: Message) => {
  // Apenas recebe a mensagem já criada
  // Adiciona ao estado local sem fazer POST novamente
  setMessages((prev) => [...prev, message]);
  
  // Atualiza timestamp da conversa
  setConversations((prev) =>
    prev.map((c) =>
      c.id === selectedId
        ? { ...c, last_message_at: new Date().toISOString() }
        : c
    )
  );
  
  toast({ description: 'Mensagem enviada' });
};

// MessageInput já fez o POST
// Passa o objeto Message retornado pela API
if (onMessageSent) {
  onMessageSent(message);  // ← Message object, já foi criado
}
```

## 📊 Arquitetura Corrigida

### Responsabilidades

| Componente | Responsabilidade |
|---|---|
| **MessageInput** | POST /api/messages<br/>Enviar mensagem<br/>Chamar callback com resultado |
| **ConversationsPage** | Receber Message<br/>Adicionar ao estado<br/>Atualizar timestamp |
| **API** | Validar e salvar<br/>Retornar Message |

### Fluxo de Dados

```
Input Field
  │
  └─ User digita "Olá"
     │
     └─ Clica Send
        │
        ├─ Valida: !empty ✓
        │
        ├─ POST /api/messages
        │  body: { conversation_id: "...", content: "Olá" }
        │
        ├─ API valida schema ✓
        │
        ├─ API insere no DB ✓
        │
        ├─ API retorna Message object ✓
        │  { id: "...", content: "Olá", created_at: "...", ... }
        │
        ├─ MessageInput chama onMessageSent(message)
        │
        └─ ConversationsPage.handleSendMessage(message)
           │
           ├─ Adiciona ao array: [...messages, message]
           │
           ├─ Atualiza conversa: last_message_at
           │
           └─ Renderiza na UI ✓
              └─ Mensagem aparece na tela!
```

## 🧪 Testes

### Teste 1: Enviar Mensagem
```
1. Abra conversa
2. Digite: "Teste"
3. Clique "Enviar"
4. ✅ Mensagem aparece
5. ✅ Sem erro no console
6. ✅ Sem POST duplicado
```

### Teste 2: Verificar Logs
```
DevTools → Console

Esperado:
[DEBUG] Creating message with body: { conversation_id: "...", content: "Teste" }
[DEBUG] Validation passed: { conversation_id: "...", content: "Teste" }
✓ Message enviada

Não deve haver:
[DEBUG] Creating message with body: { conversation_id: "...", content: { ... } }
[DEBUG] Validation error: ...
```

### Teste 3: Network Tab
```
DevTools → Network

Esperado:
POST /api/messages → 201 Created
↓
GET /api/conversations → 200 OK (carrega conversas)

Não deve haver:
POST /api/messages → 201 Created
POST /api/messages → 400 Bad Request
```

## 📝 Código Mudado

### Arquivo 1: ConversationsPage
```diff
- const handleSendMessage = async (content: string) => {
+ const handleSendMessage = async (message: Message) => {
-   const response = await fetch('/api/messages', { ... });
-   const newMessage = await response.json();
-   setMessages((prev) => [...prev, newMessage]);
+   setMessages((prev) => [...prev, message]);
}
```

### Arquivo 2: ChatWindow
```diff
- onSendMessage: (content: string) => Promise<void>;
+ onSendMessage: (message: Message) => Promise<void> | void;

- const handleSendMessage = async (content: string) => {
+ const handleSendMessage = async (message: Message) => {
-   await onSendMessage(content);
+   await onSendMessage(message);
}
```

### Arquivo 3: MessageInput
```diff
+ import type { Message } from '@/types/database';

- onMessageSent?: (message: any) => void;
+ onMessageSent?: (message: Message) => void;
```

## ✅ Checklist

- [x] Problema identificado
- [x] Causa diagnosticada
- [x] Fluxo redesenhado
- [x] Código corrigido (3 arquivos)
- [x] Tipos atualizados
- [x] Build passa ✓
- [x] Git commit realizado
- [x] Documentação criada

## 🎯 Resultado

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Submissão | 2x (erro) | 1x (sucesso) |
| Validação | ❌ Falha | ✅ Passa |
| Mensagem | ❌ Duplica/Erro | ✅ Funciona |
| Console | ❌ Erro de tipo | ✅ Sem erros |
| Network | ❌ 2x POST | ✅ 1x POST |

## 🚀 Status

```
✅ Bug corrigido
✅ Código limpo
✅ Tipos corretos
✅ Arquitetura clara
✅ Pronto para uso
```

---

**Feature Status: ✅ FUNCIONAL E PRONTA PARA TESTES**
