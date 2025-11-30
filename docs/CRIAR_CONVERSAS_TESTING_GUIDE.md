# 🧪 GUIA DE TESTES - Criar Conversas

## ⚡ Quick Test (5 minutos)

### Teste 1: Criar Primeira Conversa
```
1. Abra http://localhost:3000/dashboard/conversations
2. Clique no botão "Nova Conversa" (lado direito, com ícone +)
3. Selecione "João Silva" no dropdown
4. Clique "Criar Conversa"

Esperado:
✅ Toast verde "Conversa criada com sucesso!"
✅ Dialog fecha
✅ Nova conversa aparece na sidebar (esquerda)
✅ Conversa fica selecionada (fundo azul)
✅ Chat window abre com "João Silva"
```

### Teste 2: Criar Múltiplas Conversas
```
1. Clique "Nova Conversa" novamente
2. Selecione "Maria Santos"
3. Clique "Criar Conversa"
4. Repita com "Pedro Oliveira"
5. Repita com "Ana Costa"

Esperado:
✅ Todas as 4 conversas aparecem na sidebar
✅ Pode clicar entre elas
✅ Chat muda quando seleciona
✅ Cada uma está atribuída a você
```

### Teste 3: Validação
```
1. Clique "Nova Conversa"
2. Deixe em branco (sem selecionar)
3. Clique "Criar Conversa"

Esperado:
✅ Toast vermelho "Selecione um contato"
✅ Dialog não fecha
✅ Botão continua habilitado
```

### Teste 4: Evitar Duplicata
```
1. Crie conversa com "João Silva" (já deve existir do Teste 1)
2. Clique "Nova Conversa" novamente
3. Selecione "João Silva"
4. Clique "Criar Conversa"

Esperado:
✅ Toast "Conversa criada com sucesso!" (ou mensagem de existência)
✅ Dialog fecha
✅ Não duplica (ainda há apenas 1 conversa com João Silva)
✅ Pode prosseguir normalmente
```

## 🧬 Teste Técnico (15 minutos)

### Verificar API Diretamente
```bash
# Terminal 1: Deixe npm run dev rodando

# Terminal 2: Test a criação
curl -X POST http://localhost:3000/api/conversations/create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=seu_token_aqui" \
  -d '{
    "contact_id": "uuid-do-joao",
    "channel_id": "whatsapp"
  }' | jq

# Esperado: Status 201 + objeto conversation
```

### Verificar Lista
```bash
curl http://localhost:3000/api/conversations | jq

# Esperado: Array com as conversas criadas
```

### Verificar Banco Direto
```sql
-- Execute no Supabase SQL Editor

-- Ver conversas criadas
SELECT 
  c.id,
  c.contact_id,
  ct.name,
  c.assigned_to,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
WHERE c.assigned_to = 'seu_user_id'::uuid
ORDER BY created_at DESC;
```

## 🔍 Testes de Edge Cases

### Teste 5: Contato Não Existe
```
1. Abra DevTools (F12)
2. Network → XHR Filter
3. Clique "Nova Conversa"
4. Modifique contact_id no payload (mude para UUID inválido)
5. Envie

Esperado:
✅ API retorna 404 "Contato não encontrado"
✅ Toast "Contato não encontrado"
```

### Teste 6: Não Autenticado
```
1. Abra DevTools (F12) → Storage → Cookies
2. Remova sb-auth-token
3. Tente criar conversa

Esperado:
✅ API retorna 401 "Não autenticado"
✅ Toast "Não autenticado"
```

### Teste 7: Loading State
```
1. Abra DevTools (F12) → Network → Throttling (Fast 3G)
2. Clique "Nova Conversa"
3. Selecione contato
4. Clique "Criar Conversa"
5. Observe durante o carregamento

Esperado:
✅ Botão mostra "Criando..." com spinner
✅ Botão fica desabilitado
✅ Após resposta, fecha tudo
```

## 📱 Teste de UI/UX

### Teste 8: Design
```
1. Abra /dashboard/conversations
2. Verifique:
   - Botão "Nova Conversa" está visível ✅
   - Dialog é bonito (Shadcn pattern) ✅
   - Placeholder correto ✅
   - Dropdown mostra contatos ✅
   - Botões funcionam ✅
   - Toast feedback ✅
```

### Teste 9: Responsive
```
1. Abra DevTools (F12) → Toggle device toolbar
2. Teste em:
   - Desktop (1920x1080) ✅
   - Tablet (768x1024) ✅
   - Mobile (375x812) ✅

Esperado:
✅ Tudo redimensiona corretamente
✅ Dialog centralizado
✅ Botões alcançáveis
✅ Texto legível
```

### Teste 10: Acessibilidade
```
1. Abra /dashboard/conversations
2. Pressione TAB várias vezes
3. Navegue com teclado

Esperado:
✅ Pode usar teclado inteiro
✅ Focus outline visível
✅ Enter abre dialog
✅ Escape fecha dialog
```

## 🔄 Teste com Dados Reais

### Teste 11: Criar Conversa Comigo Mesmo
```
1. Execute SQL abaixo em Supabase:

INSERT INTO contacts (name, email, phone, tags, created_at, updated_at)
VALUES (
  'Você (Teste)',
  'voce@test.local',
  '(11) 99999-9999',
  ARRAY['teste', 'self'],
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

2. Volte para a página
3. Clique "Nova Conversa"
4. Selecione "Você (Teste)"
5. Clique "Criar Conversa"

Esperado:
✅ Conversa com você mesmo é criada
✅ Pode enviar mensagem para si mesmo
✅ Funciona normalmente
```

## 🧹 Teste de Limpeza

### Teste 12: Cleanup (Se Quiser Remover Tudo)
```sql
-- Execute em Supabase SQL Editor para remover dados de teste

-- Deletar conversas de teste
DELETE FROM conversations 
WHERE assigned_to = 'seu_user_id'::uuid;

-- Deletar contato "Você"
DELETE FROM contacts 
WHERE email = 'voce@test.local';

-- Verificar que foi deletado
SELECT COUNT(*) FROM conversations 
WHERE assigned_to = 'seu_user_id'::uuid;
```

## 📋 Checklist de Testes

- [ ] Teste 1: Criar Primeira Conversa ✅
- [ ] Teste 2: Criar Múltiplas ✅
- [ ] Teste 3: Validação ✅
- [ ] Teste 4: Evitar Duplicata ✅
- [ ] Teste 5: Contato Não Existe ✅
- [ ] Teste 6: Não Autenticado ✅
- [ ] Teste 7: Loading State ✅
- [ ] Teste 8: Design ✅
- [ ] Teste 9: Responsive ✅
- [ ] Teste 10: Acessibilidade ✅
- [ ] Teste 11: Criar Comigo Mesmo ✅
- [ ] Teste 12: Cleanup ✅

## 🐛 Se Encontrar Bugs

### Erro: "Contato não encontrado"
**Causa:** Contato não existe no banco
**Solução:** 
- Verifique se rodou o seed SQL
- Verifique database.sql em supabase/

### Erro: "Não autenticado"
**Causa:** Token expirado ou não setado
**Solução:**
- Faça logout e login novamente
- Verifique localStorage em DevTools

### Conversa não aparece
**Causa:** assigned_to não está preenchido
**Solução:**
- Execute: `supabase/CREATE_CONVERSATIONS.sql`
- Substitua SEU_USER_ID_AQUI pelo seu UUID

### Dialog não abre
**Causa:** Contatos não carregaram
**Solução:**
- Verifique console (F12)
- Verifique rede (Network tab)
- Recarregue página

## 📞 Suporte

Se tiver problema:
1. Verifique console do navegador (F12)
2. Verifique logs do npm run dev
3. Execute o SQL de debug: `supabase/DEBUG_CONVERSATIONS.sql`
4. Leia `docs/CRIAR_CONVERSAS_FEATURE.md`

## ✅ Quando Passar em Todos os Testes

Você pode:
- ✅ Confiar na feature para produção
- ✅ Usar em staging
- ✅ Compartilhar com usuários
- ✅ Documentar para o time
- ✅ Fazer próxima feature

Parabéns! 🎉
