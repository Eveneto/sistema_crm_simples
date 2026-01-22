# 🎯 PRÓXIMOS PASSOS - EVOLUTION API

Você fez deploy do seu **CRM no Railway** ✅

Agora precisa de uma **Evolution API funcional**.

---

## 🚀 OPÇÃO MAIS SIMPLES (⭐ RECOMENDADO)

### **Usar Evolution.app (Gerenciada)**

Tempo: **10 minutos**

### Passo 1: Criar conta em Evolution.app

```
1. Acesse: https://evolution-api.com/
2. Clique em "Sign Up"
3. Crie conta (email + senha)
4. Confirme email
```

### Passo 2: Criar uma instância

```
1. Login em evolution-api.com
2. Clique em "New Instance" ou "Create Instance"
3. Dê um nome (ex: "crm_instance")
4. Configure:
   - Database: Cloud (ou Local SQLite)
   - Enable Webhook: ✅ SIM
5. Clique "Create"
6. Aguarde 30 segundos
```

### Passo 3: Obter API Key e URL

Após criar instância, você receberá:

```
API_KEY: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
URL: https://api.evolution-api.com/instance/seu-instance-id
```

### Passo 4: Atualizar .env.local

Abra seu `.env.local` e atualize:

```env
EVOLUTION_API_URL=https://api.evolution-api.com/instance/seu-instance-id
EVOLUTION_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Passo 5: Testar

```bash
# No seu CRM já deployado no Railway:
# Acesse a página WhatsApp
https://sistemacrmsimples-production.up.railway.app/channels/whatsapp

# QR Code deve aparecer automaticamente!
```

---

## ✅ CHECKLIST

- [ ] Conta criada em evolution-api.com
- [ ] Instância criada
- [ ] API Key copiada
- [ ] .env.local atualizado
- [ ] Build rodado: `npm run build`
- [ ] Deploy atualizado no Railway
- [ ] Página WhatsApp mostrando QR Code

---

## 🎁 BÔNUS: Se quiser rodar Evolution API no Railway também

Você pode fazer **deploy de Evolution API no Railway** também:

```
1. Fork: https://github.com/EvolutionAPI/evolution-api
2. No Railway: New Project → Deploy from GitHub
3. Selecione seu fork do evolution-api
4. Configure variáveis de ambiente
5. Deploy
6. Copie URL gerada
7. Atualize EVOLUTION_API_URL no seu CRM
```

Mas **não é necessário** - Evolution.app já funciona perfeitamente!

---

## 📞 SUPORTE

Se tiver dúvida na configuração:

1. Evolution.app tem documentação em: https://doc.evolution-api.com
2. Seu CRM está em: https://sistemacrmsimples-production.up.railway.app

---

**Próximo passo:** Se registre em evolution-api.com e crie uma instância! 🚀
