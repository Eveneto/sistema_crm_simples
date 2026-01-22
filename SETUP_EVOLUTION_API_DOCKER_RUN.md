# 🚀 SETUP RÁPIDO - EVOLUTION API COM DOCKER RUN

**Versão simplificada - sem docker-compose**

---

## 📋 PRÉ-REQUISITOS

- Docker instalado
- Seu .env.local já configurado (✅ Feito!)

---

## 🚀 PASSO 1: RODAR EVOLUTION API

### Opção A: Usando a API Key padrão (mude-me)

```bash
docker run -d \
    --name evolution_api \
    -p 8080:8080 \
    -e AUTHENTICATION_API_KEY=mude-me \
    atendai/evolution-api:latest
```

### Opção B: Com uma API Key customizada

```bash
docker run -d \
    --name evolution_api \
    -p 8080:8080 \
    -e AUTHENTICATION_API_KEY=sua_chave_segura_aqui \
    atendai/evolution-api:latest
```

**Se escolheu Opção B**, atualize seu `.env.local`:

```env
EVOLUTION_API_KEY=sua_chave_segura_aqui
```

---

## ✅ PASSO 2: VERIFICAR SE ESTÁ RODANDO

Acesse no navegador:

```
http://localhost:8080
```

**Resposta esperada:**

```json
{
  "status": 200,
  "message": "Welcome to the Evolution API, it is working!",
  "version": "1.x.x",
  "swagger": "http://localhost:8080/docs",
  "manager": "http://localhost:8080/manager",
  "documentation": "https://doc.evolution-api.com"
}
```

**Ou via terminal:**

```bash
curl http://localhost:8080
```

---

## 🎯 PASSO 3: RODAR SEU CRM

```bash
npm run dev
```

Seu CRM estará em: `http://localhost:3001`

---

## 🔐 PASSO 4: ACESSAR O PAINEL

- **Manager do Evolution API:** `http://localhost:8080/manager`
- **Seu CRM WhatsApp:** `http://localhost:3001/channels/whatsapp`

---

## 📱 PASSO 5: CONECTAR WHATSAPP

1. Acesse `http://localhost:3001/channels/whatsapp`
2. Clique na aba **"QR Code"**
3. Escaneie com seu celular
4. ✅ Pronto!

---

## 🧪 TESTAR API

### Health Check

```bash
curl http://localhost:8080
```

### Criar Instância WhatsApp

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: mude-me" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "crm_instance",
    "token": "seu_token_aqui",
    "number": "5511987654321"
  }'
```

### Obter QR Code

```bash
curl http://localhost:8080/instance/qrcode/crm_instance \
  -H "apikey: mude-me"
```

### Enviar Mensagem

```bash
curl -X POST http://localhost:8080/message/sendText/crm_instance \
  -H "apikey: mude-me" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511987654321",
    "text": "Olá, teste!"
  }'
```

---

## 🛠️ COMANDOS ÚTEIS

### Ver logs do container

```bash
docker logs evolution_api
```

### Seguir logs em tempo real

```bash
docker logs -f evolution_api
```

### Parar Evolution API

```bash
docker stop evolution_api
```

### Reiniciar Evolution API

```bash
docker restart evolution_api
```

### Remover container

```bash
docker rm evolution_api
```

### Ver containers rodando

```bash
docker ps
```

---

## 🔑 VARIÁVEIS CONFIGURADAS

Seu `.env.local` está assim:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=mude-me
EVOLUTION_INSTANCE_NAME=crm_instance
EVOLUTION_WEBHOOK_TOKEN=seu_webhook_token_aqui
```

---

## 📊 ARQUITETURA

```
┌─────────────────────┐
│  SEU CRM (Port 3001)│
│  Next.js            │
└──────────┬──────────┘
           │ REST API
           ↓
┌─────────────────────┐
│ Evolution API       │
│ (Port 8080)         │
│ Docker Container    │
└──────────┬──────────┘
           │ WhatsApp
           ↓
      WhatsApp
```

---

## ⚠️ TROUBLESHOOTING

### "Porta 8080 já em uso"

```bash
# Veja qual processo está usando a porta
lsof -i :8080

# Ou use outra porta
docker run -d \
    --name evolution_api \
    -p 8081:8080 \  # Mapeia porta 8081 para 8080 do container
    -e AUTHENTICATION_API_KEY=mude-me \
    atendai/evolution-api:latest

# Depois atualize .env.local
EVOLUTION_API_URL=http://localhost:8081
```

### "Docker não encontrado"

```bash
# Instalar Docker (Ubuntu/Debian)
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### "Container não inicia"

```bash
# Ver erro
docker logs evolution_api

# Tentar criar novamente
docker rm evolution_api
docker run -d --name evolution_api -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=mude-me \
  atendai/evolution-api:latest
```

### "Webhook não funciona"

- Verificar se `EVOLUTION_WEBHOOK_TOKEN` está configurado
- Certificar que a URL do webhook aponta para `http://localhost:3001/api/webhook/whatsapp`
- Verificar logs: `docker logs evolution_api`

---

## ✅ CHECKLIST

- [ ] Docker rodando (`docker --version`)
- [ ] Evolution API em execução (`curl http://localhost:8080`)
- [ ] .env.local configurado
- [ ] `npm run dev` rodando
- [ ] Acessar `http://localhost:3001/channels/whatsapp`
- [ ] QR Code aparecendo
- [ ] WhatsApp conectado

---

## 📚 PRÓXIMOS PASSOS

1. ✅ Evolution API rodando
2. ✅ Seu CRM rodando
3. [ ] Conectar WhatsApp via QR Code
4. [ ] Enviar primeira mensagem
5. [ ] Testar webhook
6. [ ] Deploy em produção

---

_Pronto! Agora é só rodar o `docker run` acima e começar a usar!_ 🚀
