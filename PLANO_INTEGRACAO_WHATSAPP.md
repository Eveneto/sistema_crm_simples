# 📱 PLANO DE INTEGRAÇÃO WHATSAPP - PRÁTICO E EXECUTÁVEL

**22 de janeiro de 2026 | Seu projeto já está em produção no Vercel** ✅

---

## 🎯 STATUS ATUAL

```
✅ Projeto em produção (Vercel)
✅ Webhook estrutura pronta (/api/webhook/whatsapp/route.ts)
✅ Evolution API folder existente
✅ Env vars configuradas (.env.local)
✅ Database schema pronto
⏳ Integração WhatsApp: NÃO IMPLEMENTADA AINDA
```

---

## 📋 O QUE VOCÊ TEM PRONTO

### 1. Evolution API (Backend independente)

```
/evolution-api/
├─ src/api/integrations/channel/evolution/
│  └─ Controlador e serviço já implementados
├─ README.md com documentação
└─ Pronto para ser rodado separadamente
```

### 2. Webhook Handler

```
src/app/api/webhook/whatsapp/route.ts
└─ Endpoint pronto para receber webhooks da Evolution API
```

### 3. Environment Variables

```
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE_NAME=
```

### 4. Database Tables

```
conversations
messages
channels (com suporte a type='whatsapp')
```

---

## 🚀 FASE 1: PREPARAR EVOLUTION API (2-3 horas)

Evolution API é um **projeto Node.js independente** que roda separadamente do seu CRM.

### Opção A: Docker (RECOMENDADO - Mais fácil)

#### 1. Pull imagem Docker

```bash
docker pull evoapicloud/evolution-api:latest
```

#### 2. Criar arquivo docker-compose.yml

```yaml
version: '3.8'

services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    ports:
      - '8080:8080' # API
      - '8081:8081' # Webhook listener
    environment:
      # API Config
      NODE_ENV: production
      SERVER_PORT: 8080

      # JWT
      JWT_SECRET: sua-chave-super-secreta-aqui-minimo-32-caracteres
      JWT_EXPIRATION_TIME: 3600

      # Database (se usar PostgreSQL - recomendado)
      DATABASE_URL: postgresql://user:password@postgres:5432/evolution

      # API Auth
      API_KEY: sua-api-key-super-secreta-aqui

      # Webhook
      WEBHOOK_VERIFICATION_TOKEN: seu-token-webhook
      WEBHOOK_PATH: /webhook

      # Baileys Config (para WhatsApp Web)
      LOGS: 'true'
      STORE: 'true'
      CLEAN_STORE_STARTUP_INTERVAL: 3600
      MESSAGES_UPSERT_EDIT_STATUS: 'true'

    depends_on:
      - postgres
    volumes:
      - evolution-data:/app/instances
    networks:
      - evolution-network

  postgres:
    image: postgres:15-alpine
    container_name: evolution-postgres
    environment:
      POSTGRES_DB: evolution
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - evolution-network

volumes:
  evolution-data:
  postgres-data:

networks:
  evolution-network:
    driver: bridge
```

#### 3. Rodar

```bash
docker-compose up -d

# Verificar se está rodando
docker logs evolution-api
# Deve mostrar: Server running on port 8080
```

#### 4. Testar API

```bash
curl -X GET http://localhost:8080/api/instances \
  -H "Authorization: Bearer sua-api-key-super-secreta-aqui"
```

---

### Opção B: Node.js Local (Se preferir)

```bash
cd evolution-api

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Configurar .env com suas values
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
# API_KEY=...

# Rodar
npm run dev

# Em produção
npm run build
npm run start
```

---

## 🔌 FASE 2: CONFIGURAR WEBHOOK (1 hora)

### 1. Atualizar webhook handler em seu CRM

```typescript
// src/app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface WebhookPayload {
  event: string;
  instanceId?: string;
  data?: {
    key?: { remoteJid: string };
    message?: { conversation: string };
    pushName?: string;
    messageTimestamp?: number;
    status?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();

    // Verificar token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedToken = process.env.EVOLUTION_WEBHOOK_TOKEN;

    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[WhatsApp Webhook] Event: ${body.event}`);

    switch (body.event) {
      case 'messages.upsert':
        return await handleMessageReceived(body.data);

      case 'contacts.upsert':
        return await handleContactUpdate(body.data);

      case 'chats.upsert':
        return await handleChatUpdate(body.data);

      case 'connection.update':
        return await handleConnectionUpdate(body.data);

      default:
        console.log(`[WhatsApp Webhook] Unknown event: ${body.event}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleMessageReceived(data: any) {
  try {
    const remoteJid = data?.key?.remoteJid;
    const message = data?.message?.conversation || data?.message?.imageMessage?.caption || '';
    const pushName = data?.pushName;
    const messageId = data?.key?.id;

    if (!remoteJid || !message) return NextResponse.json({ ok: true });

    // 1. Criar/atualizar contato
    const { data: contact } = await supabase
      .from('contacts')
      .upsert(
        {
          phone: remoteJid.replace('@s.whatsapp.net', ''),
          name: pushName,
          source: 'whatsapp',
          updated_at: new Date(),
        },
        {
          onConflict: 'phone',
        }
      )
      .select()
      .single();

    // 2. Criar/atualizar conversa
    const { data: conversation } = await supabase
      .from('conversations')
      .upsert(
        {
          contact_id: contact?.id,
          channel: 'whatsapp',
          last_message: message,
          last_message_at: new Date(),
          updated_at: new Date(),
        },
        {
          onConflict: 'contact_id',
        }
      )
      .select()
      .single();

    // 3. Salvar mensagem
    await supabase.from('messages').insert({
      conversation_id: conversation?.id,
      sender: 'contact',
      text: message,
      external_message_id: messageId,
      channel: 'whatsapp',
      created_at: new Date(),
    });

    console.log(
      `[WhatsApp] Message from ${pushName} (${remoteJid}): ${message.substring(0, 50)}...`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[WhatsApp handleMessageReceived]', error);
    return NextResponse.json({ error: 'Message handling failed' }, { status: 500 });
  }
}

async function handleContactUpdate(data: any) {
  // Atualizar informações de contato
  return NextResponse.json({ ok: true });
}

async function handleChatUpdate(data: any) {
  // Atualizar informações de chat
  return NextResponse.json({ ok: true });
}

async function handleConnectionUpdate(data: any) {
  // Log de conexão/desconexão
  console.log('[WhatsApp Connection Update]', data);
  return NextResponse.json({ ok: true });
}
```

### 2. Atualizar .env.local

```bash
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key-super-secreta-aqui
EVOLUTION_WEBHOOK_TOKEN=seu-token-webhook
EVOLUTION_INSTANCE_NAME=crm_instance
```

### 3. Testar webhook localmente

```bash
# Terminal 1: Rodar seu CRM em dev
npm run dev

# Terminal 2: Testar webhook
curl -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-webhook" \
  -d '{
    "event": "messages.upsert",
    "data": {
      "key": {
        "id": "test-123",
        "remoteJid": "5511999999999@s.whatsapp.net"
      },
      "message": {
        "conversation": "Olá, testando!"
      },
      "pushName": "João"
    }
  }'

# Resposta esperada:
# {"ok":true}
```

---

## 📲 FASE 3: CONECTAR WHATSAPP (1 hora)

### 1. Criar instância WhatsApp na Evolution API

```bash
# Obter QR Code
curl -X POST http://localhost:8080/api/instances \
  -H "Authorization: Bearer sua-api-key-super-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "crm_instance",
    "qrcode": true,
    "integration": "BAILEYS",
    "producer": {
      "enabled": true,
      "events": [
        "QRCODE_UPDATED",
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "SEND_MESSAGE",
        "CONTACTS_UPSERT",
        "CHATS_UPSERT",
        "CHATS_UPDATE",
        "CONNECTION_UPDATE",
        "STATUS_INSTANCE"
      ]
    },
    "webhook": {
      "enabled": true,
      "url": "https://seu-dominio.vercel.app/api/webhook/whatsapp",
      "events": [
        "QRCODE_UPDATED",
        "MESSAGES_UPSERT",
        "SEND_MESSAGE",
        "CONTACTS_UPSERT",
        "CHATS_UPSERT",
        "CONNECTION_UPDATE"
      ],
      "api_key": "seu-token-webhook"
    }
  }'

# Resposta:
# {
#   "instance": {
#     "instanceName": "crm_instance",
#     "qrcode": {
#       "code": "[QR CODE AQUI - escanear no WhatsApp]"
#     }
#   }
# }
```

### 2. Escanear QR Code

```
1. Abra WhatsApp no seu telefone
2. Vá em: Configurações → Aparelhos conectados → Conectar um aparelho
3. Aponte câmera para o QR Code exibido pela API
4. Confirmar
```

### 3. Verificar conexão

```bash
curl -X GET http://localhost:8080/api/instances/crm_instance \
  -H "Authorization: Bearer sua-api-key-super-secreta-aqui"

# Resposta deve incluir:
# "connectionStatus": "open"
```

---

## 🔄 FASE 4: ENVIAR MENSAGEM (30 min)

### 1. Criar API endpoint para enviar mensagem

```typescript
// src/app/api/whatsapp/send/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SendMessageRequest {
  phone: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, message }: SendMessageRequest = await request.json();

    // Formatar número (adicionar código país se necessário)
    const formattedPhone = phone.replace(/\D/g, '');
    const whatsappNumber = `${formattedPhone}@s.whatsapp.net`;

    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/api/message/sendText/crm_instance`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EVOLUTION_API_KEY}`,
        },
        body: JSON.stringify({
          number: whatsappNumber,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Salvar mensagem no banco
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('messages').insert({
      conversation_id: null, // Você vai associar depois
      sender: 'bot',
      text: message,
      external_message_id: result.key?.id,
      channel: 'whatsapp',
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Send WhatsApp]', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
```

### 2. Testar envio

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Olá! Mensagem de teste do seu CRM"
  }'
```

---

## 🎨 FASE 5: INTERFACE NO CRM (2-3 horas)

### Criar página de canais WhatsApp

```typescript
// src/app/(dashboard)/dashboard/canais/whatsapp/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface WhatsAppInstance {
  instanceName: string
  connectionStatus: 'open' | 'closed' | 'connecting'
  phoneNumber?: string
  qrcode?: {
    code: string
  }
}

export default function WhatsAppChannelPage() {
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInstanceStatus()
  }, [])

  const fetchInstanceStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/instance-status')
      const data = await response.json()
      setInstance(data)
    } catch (error) {
      console.error('Failed to fetch instance status:', error)
      toast.error('Erro ao carregar status da instância')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !message) {
      toast.error('Preencha o telefone e a mensagem')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      })

      if (!response.ok) throw new Error('Failed to send')

      toast.success('Mensagem enviada com sucesso!')
      setPhone('')
      setMessage('')
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Canal WhatsApp</h1>
        <p className="text-gray-600">Integração com Evolution API</p>
      </div>

      {/* Status da Conexão */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>

        {instance ? (
          <div className="space-y-4">
            <div>
              <span className="text-gray-600">Status: </span>
              <span className={`font-semibold ${
                instance.connectionStatus === 'open' ? 'text-green-600' : 'text-red-600'
              }`}>
                {instance.connectionStatus === 'open' ? '🟢 Conectado' : '🔴 Desconectado'}
              </span>
            </div>

            {instance.phoneNumber && (
              <div>
                <span className="text-gray-600">Número: </span>
                <span className="font-semibold">{instance.phoneNumber}</span>
              </div>
            )}

            {instance.connectionStatus !== 'open' && instance.qrcode && (
              <div>
                <p className="text-gray-600 mb-2">Escanear QR Code:</p>
                <img src={`data:image/png;base64,${instance.qrcode.code}`} alt="QR Code" className="w-64" />
              </div>
            )}

            <Button onClick={fetchInstanceStatus} variant="outline">
              Atualizar Status
            </Button>
          </div>
        ) : (
          <p className="text-gray-600">Instância não encontrada</p>
        )}
      </Card>

      {/* Enviar Mensagem */}
      {instance?.connectionStatus === 'open' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enviar Mensagem</h2>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <Input
                type="tel"
                placeholder="5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={4}
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
```

---

## 📊 FASE 6: TESTES (1 hora)

### Checklist de Testes

```
[ ] Evolution API rodando (docker ou Node.js)
[ ] QR Code escanado
[ ] Webhook recebendo mensagens
[ ] Mensagens aparecem no banco de dados
[ ] Consegue enviar mensagem do CRM
[ ] Mensagens aparecem no WhatsApp
[ ] Contatos criados automaticamente
[ ] Conversas criadas automaticamente
[ ] Interface mostra status corretamente
```

### Teste End-to-End

```
1. Enviar mensagem pelo CRM para seu número
   → Verificar se chegou no WhatsApp ✅

2. Responder no WhatsApp
   → Verificar se aparece no CRM ✅

3. Novo contato envia mensagem
   → Contato criado automaticamente? ✅
   → Conversa criada? ✅
```

---

## 🚀 FASE 7: DEPLOY EM PRODUÇÃO

### 1. Deploy Evolution API (Recomendado: Servidor dedicado ou Railway)

**Opção: Railway.app**

```
1. Criar conta em railway.app
2. Conectar GitHub
3. Deploy app da pasta evolution-api/
4. Adicionar variáveis de ambiente
5. Gerar URL pública
```

### 2. Atualizar .env.local em Produção no Vercel

```
EVOLUTION_API_URL=https://seu-evolution-api.railway.app
EVOLUTION_API_KEY=sua-api-key-secreta
EVOLUTION_WEBHOOK_TOKEN=seu-token-webhook
```

### 3. Deploy do CRM (Next.js)

```bash
git add -A
git commit -m "feat: WhatsApp integration with Evolution API"
git push origin main
# Vercel fará deploy automático
```

---

## 📚 RECURSOS

- **Evolution API Docs:** https://doc.evolution-api.com
- **Baileys (WhatsApp Web):** https://github.com/WhiskeySockets/Baileys
- **Docker Hub:** https://hub.docker.com/r/evoapicloud/evolution-api

---

## ⏱️ TIMELINE

```
Hoje (4-5 horas):
├─ Fase 1: Setup Evolution API (1-2h)
├─ Fase 2: Webhook (1h)
└─ Fase 3: Conectar WhatsApp (1h)

Amanhã (3-4 horas):
├─ Fase 4: API de envio (30m)
├─ Fase 5: Interface CRM (2-3h)
└─ Fase 6: Testes (1h)

Depois:
└─ Fase 7: Deploy Produção (30m)
```

---

## ✅ SUCESSO!

Quando terminar:

```
✅ WhatsApp integrado no CRM
✅ Receber mensagens automaticamente
✅ Enviar mensagens do CRM
✅ Histórico completo no banco
✅ Contatos criados automaticamente
✅ Pronto para clientes
```

---

**Próximo passo: Comece pela Fase 1 com Docker! 🐳**
