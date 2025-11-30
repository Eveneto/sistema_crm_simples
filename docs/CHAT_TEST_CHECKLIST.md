# 🧪 CHAT MVP - QUICK TEST CHECKLIST

**Para testar localmente após `npm run dev`**

---

## ✅ Teste 1: Página Carrega

```
[ ] Abrir: http://localhost:3000/dashboard/conversas
[ ] Página não tem erros no console
[ ] Layout mostra 2 colunas (sidebar + chat)
[ ] Sidebar mostra "Conversas"
```

---

## ✅ Teste 2: Buscar Conversas

```
[ ] Sidebar lista conversas (se tiver dados)
[ ] Mostra nome do contato
[ ] Mostra último preview de mensagem
[ ] Mostra badge de não-lido
[ ] Clicando seleciona conversa
```

---

## ✅ Teste 3: Carregar Chat

```
[ ] Selecionando conversa mostra chat window
[ ] Header mostra nome do contato
[ ] Mostra histórico de mensagens
[ ] Mensagens aparecem com autor + hora
[ ] Auto-scroll para última mensagem
```

---

## ✅ Teste 4: Enviar Mensagem

```
[ ] Digitar mensagem no input
[ ] Clicar botão enviar (ou Enter)
[ ] Mensagem aparece na lista
[ ] Input limpa após envio
[ ] Não há erros no console
```

---

## ✅ Teste 5: Marcar como Lido

```
[ ] Selecionando conversa → chama API /read
[ ] Badge de não-lido desaparece
[ ] Nenhum erro no console
```

---

## ✅ Teste 6: Search

```
[ ] Digitar nome de contato na search
[ ] Lista filtra resultados
[ ] Limpar search mostra tudo novamente
```

---

## ❌ Problemas Conhecidos

### **currentUserId está vazio**
- Chat funciona mesmo assim
- Depois integrar com auth real

### **Sem dados de teste**
- Conversa precisa existir no DB
- Pode adicionar manual no Supabase

### **Styling cosmético**
- Pode melhorar depois
- Funcionalidade está ok

---

## 🎯 Se Algum Teste Falhar

1. **Check Console** (F12 → Console)
   - Ver se tem erro JavaScript

2. **Check Network** (F12 → Network)
   - Ver se APIs estão sendo chamadas
   - Ver status das requisições

3. **Check Supabase**
   - Verificar RLS policies
   - Verificar dados no banco

4. **Check Auth Token**
   - Confirmar que está logado
   - Verificar token valido

---

## ✅ RESULTADO ESPERADO

Se todos os testes passarem = **Chat funciona!** 🎉

---

**Tempo de teste:** ~10 minutos

---
