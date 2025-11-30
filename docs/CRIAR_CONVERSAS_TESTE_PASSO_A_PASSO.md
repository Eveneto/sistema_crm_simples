# ✅ TESTE: Criar Conversas - Passo a Passo

## 🚀 Teste Rápido (5 minutos)

### 1️⃣ Inicie o servidor
```bash
npm run dev
```

### 2️⃣ Faça login
- Acesse: http://localhost:3000/dashboard/conversations
- Se solicitado, faça login com sua conta

### 3️⃣ Crie uma conversa
1. Clique no botão **"Nova Conversa"** (canto superior direito)
2. No dropdown, selecione um contato (ex: "João Silva")
3. Clique **"Criar Conversa"**
4. ✅ Deve aparecer um toast "Conversa criada com sucesso!"
5. ✅ A conversa deve aparecer na sidebar (esquerda)
6. ✅ A conversa deve estar selecionada (destaque)

### 4️⃣ Teste mensagens
1. No campo de input (parte inferior), digite: "Olá teste"
2. Pressione **Enter** ou clique enviar
3. ✅ Mensagem deve aparecer na conversa
4. ✅ Status deve mudar de "Enviando..." para ✓

## 📋 Testes Detalhados

### Teste 1: Criar Primeira Conversa
**Objetivo:** Validar criação básica de conversa

```
✅ Pré-requisito: Está logado e na página /dashboard/conversations
✅ Passo 1: Vê o botão "Nova Conversa" no header?
✅ Passo 2: Clica nele e abre um dialog?
✅ Passo 3: Dropdown mostra contatos (João Silva, Maria Santos, etc)?
✅ Passo 4: Seleciona "João Silva"
✅ Passo 5: Clica "Criar Conversa"
✅ Passo 6: Vê toast "Conversa criada com sucesso!"?
✅ Passo 7: Conversa aparece na sidebar?
✅ Passo 8: A conversa está selecionada (background azul)?
✅ Passo 9: Pode enviar mensagens?
```

**Resultado Esperado:** ✅ Todos os passos funcionam sem erros

---

### Teste 2: Criar Múltiplas Conversas
**Objetivo:** Validar criação de várias conversas e navegação

```
✅ Crie conversa com "João Silva"
✅ Clique "Nova Conversa" novamente
✅ Crie conversa com "Maria Santos"
✅ Clique "Nova Conversa" novamente
✅ Crie conversa com "Pedro Oliveira"
✅ Sidebar deve mostrar 3 conversas
✅ Pode clicar em cada uma e navegar?
✅ Mensagens carregam corretamente?
```

**Resultado Esperado:** Todas as 3 conversas aparecem e funcionam

---

### Teste 3: Evitar Duplicatas
**Objetivo:** Validar que não cria conversa duplicada

```
✅ Crie conversa com "Maria Santos"
✅ Clique "Nova Conversa" novamente
✅ Selecione "Maria Santos" novamente
✅ Clique "Criar Conversa"
✅ Devería mostrar: "Conversa já existe"
✅ Não deve duplicar na sidebar
✅ Deve voltar para a conversa existente
```

**Resultado Esperado:** Retorna conversa existente, sem duplicar

---

### Teste 4: Validação de Inputs
**Objetivo:** Validar que obriga selecionar contato

```
✅ Clique "Nova Conversa"
✅ NÃO selecione nenhum contato
✅ Tente clicar "Criar Conversa"
✅ Botão está disabled?
✅ Se clica mesmo assim, mostra erro?
```

**Resultado Esperado:** Botão disabled até selecionar contato

---

### Teste 5: Enviar Mensagem
**Objetivo:** Validar que consegue enviar mensagem na conversa criada

```
✅ Crie conversa com qualquer contato
✅ Na conversa, localize o input (parte inferior)
✅ Digite uma mensagem (ex: "Olá, tudo bem?")
✅ Pressione Enter ou clique enviar
✅ Mensagem aparece na conversa?
✅ Mostra "Enviando..." enquanto carrega?
✅ Depois mostra checkmark?
```

**Resultado Esperado:** Mensagem é enviada e aparece na conversa

---

## 🐛 Se Tiver Erros

### Erro: "contacts.map is not a function"
**Solução:** Recarregue a página (F5)

### Erro: "Contato não encontrado"
**Motivo:** Contato selecionado foi deletado
**Solução:** Selecione outro contato

### Erro: "Conversa não aparece após criação"
**Motivo:** Pode ser delay na sincronização
**Solução:** Recarregue a página (F5)

### Nenhum contato no dropdown
**Motivo:** Não há contatos cadastrados
**Solução:** Primeiro crie contatos em /dashboard/contacts

### Erro ao enviar mensagem
**Motivo:** API pode estar com problema
**Solução:** Verifique logs em `npm run dev` terminal

---

## 📊 Checklist de Validação

| Funcionalidade | Status | Notas |
|---|---|---|
| Botão "Nova Conversa" visível | ✅ | Canto superior direito |
| Dialog abre ao clicar | ✅ | Bonito com Shadcn/ui |
| Dropdown mostra contatos | ✅ | Deveria ter 15+ contatos teste |
| Criar conversa funciona | ✅ | Toast de sucesso |
| Conversa aparece na sidebar | ✅ | Imediato |
| Auto-seleciona conversa | ✅ | Destaque em azul |
| Evita duplicatas | ✅ | Retorna existente |
| Envia mensagens | ✅ | Aparece na conversa |
| UI responsiva | ✅ | Funciona em mobile? |
| Logout/Login funciona | ✅ | Conversas recarregam |

---

## 🎯 Teste de Integração

### Fluxo Completo

```
1. Login ✅
   └─ Vai para /dashboard/conversations
   
2. Criar Conversa ✅
   └─ Clica "Nova Conversa"
   └─ Seleciona contato
   └─ Clica "Criar"
   └─ Aparece na sidebar
   
3. Enviar Mensagem ✅
   └─ Digita mensagem
   └─ Pressiona Enter
   └─ Aparece na conversa
   
4. Navegar ✅
   └─ Clica em outra conversa
   └─ Mensagens recarregam
   
5. Criar Outra ✅
   └─ Repete passos 2-4 com outro contato
   
6. Logout ✅
   └─ Faz logout
   └─ Login novamente
   └─ Conversas ainda estão lá
```

---

## 📹 Cenários de Video

### Cenário 1: Happy Path (2 min)
```
1. Mostrar página vazia
2. Clicar "Nova Conversa"
3. Selecionar "João Silva"
4. Criar
5. Enviar mensagem
6. Toast de sucesso
7. Criar outra com "Maria"
8. Navegar entre as 2
```

### Cenário 2: Edge Cases (1 min)
```
1. Tentar criar sem selecionar
2. Tentar criar duplicata
3. Validação funcionando
```

---

## 💡 Dicas para Teste Eficiente

1. **Abra DevTools** (F12)
   - Aba Console para ver erros
   - Aba Network para ver requisições API

2. **Teste no incógnito**
   - Para simular novo usuário
   - Sem cache do navegador

3. **Teste em mobile**
   - DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
   - Valida responsividade

4. **Teste logout/login**
   - Garante que conversas persistem
   - Valida permissões

---

## ✅ Sucesso = Todos Estes Itens

- [ ] Botão "Nova Conversa" visible e funciona
- [ ] Dialog com dropdown de contatos
- [ ] Cria conversa com sucesso
- [ ] Conversas aparecem na sidebar
- [ ] Auto-seleciona ao criar
- [ ] Evita duplicatas
- [ ] Pode enviar mensagens
- [ ] Toast feedback
- [ ] Build passa
- [ ] Sem erros no console

**Se todos estão ✅, a feature está 100% funcional!**
