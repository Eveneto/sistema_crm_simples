'use client';

/**
 * /channels/whatsapp — Configuração do canal Meta WhatsApp Cloud API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MetaChannelForm,
  MetaWhatsAppSender,
  ChannelStatusCard,
  type ChannelData,
} from '@/components/whatsapp/whatsapp-manager';
import {
  MessageCircle,
  Plus,
  Settings,
  Send,
  BookOpen,
  Loader2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

export default function WhatsAppChannelPage() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhook/whatsapp`
      : '/api/webhook/whatsapp';

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data: ChannelData[] = await res.json();
        setChannels(data);
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao buscar canais:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const selectedChannel = channels.find((c) => c.id === selectedId) ?? null;

  const handleChannelSaved = (channel: ChannelData) => {
    setShowNewForm(false);
    fetchChannels();
    setSelectedId(channel.id);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h1 className="text-2xl font-bold">Canal WhatsApp</h1>
              <p className="text-muted-foreground text-sm">
                Integração com Meta WhatsApp Business Cloud API (oficial)
              </p>
            </div>
          </div>
          <Button onClick={() => setShowNewForm((v) => !v)} variant={showNewForm ? 'outline' : 'default'}>
            <Plus className="h-4 w-4 mr-2" />
            {showNewForm ? 'Cancelar' : 'Novo Canal'}
          </Button>
        </div>

        {/* Formulário de novo canal */}
        {showNewForm && (
          <MetaChannelForm onSuccess={handleChannelSaved} />
        )}

        {/* Carregando */}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando canais...
          </div>
        )}

        {/* Sem canais */}
        {!loading && channels.length === 0 && !showNewForm && (
          <Card className="p-8 text-center space-y-3">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold text-lg">Nenhum canal configurado</p>
            <p className="text-muted-foreground text-sm">
              Clique em <strong>Novo Canal</strong> para conectar seu número WhatsApp Business.
            </p>
          </Card>
        )}

        {/* Canais existentes */}
        {!loading && channels.length > 0 && (
          <div className="space-y-4">
            {/* Seletor de canal (quando houver mais de 1) */}
            {channels.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {channels.map((ch) => (
                  <Button
                    key={ch.id}
                    variant={selectedId === ch.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedId(ch.id)}
                  >
                    {ch.meta_display_phone ?? ch.name}
                  </Button>
                ))}
              </div>
            )}

            {selectedChannel && (
              <Tabs defaultValue="status" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="status" className="gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Status</span>
                  </TabsTrigger>
                  <TabsTrigger value="config" className="gap-1.5">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Configurar</span>
                  </TabsTrigger>
                  <TabsTrigger value="send" className="gap-1.5">
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Testar</span>
                  </TabsTrigger>
                  <TabsTrigger value="guide" className="gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Guia</span>
                  </TabsTrigger>
                </TabsList>

                {/* Status */}
                <TabsContent value="status">
                  <div className="grid md:grid-cols-2 gap-4">
                    <ChannelStatusCard channel={selectedChannel} webhookUrl={webhookUrl} />
                    <Card className="p-6 space-y-4">
                      <h2 className="font-semibold">Próximos Passos</h2>
                      <ol className="text-sm space-y-3 list-decimal list-inside text-muted-foreground">
                        <li>
                          Copie a <strong>Webhook URL</strong> ao lado
                        </li>
                        <li>
                          Acesse{' '}
                          <a
                            href="https://developers.facebook.com/apps"
                            target="_blank"
                            rel="noreferrer"
                            className="underline inline-flex items-center gap-1"
                          >
                            Meta for Developers <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          Vá em <strong>WhatsApp → Configuração → Webhooks</strong>
                        </li>
                        <li>
                          Cole a URL e o <strong>Verify Token</strong> ao lado
                        </li>
                        <li>
                          Assine os campos: <code className="bg-muted px-1 rounded">messages</code>
                        </li>
                        <li>
                          Teste o envio na aba <strong>Testar</strong>
                        </li>
                      </ol>

                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>Desenvolvimento local:</strong> a Meta não consegue alcançar
                          localhost. Use{' '}
                          <a
                            href="https://ngrok.com"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            ngrok
                          </a>{' '}
                          ou{' '}
                          <a
                            href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Cloudflare Tunnel
                          </a>{' '}
                          para expor a porta 3000.
                        </AlertDescription>
                      </Alert>
                    </Card>
                  </div>
                </TabsContent>

                {/* Configurar */}
                <TabsContent value="config">
                  <div className="grid md:grid-cols-2 gap-4">
                    <MetaChannelForm
                      channel={selectedChannel as any}
                      onSuccess={handleChannelSaved}
                    />
                    <Card className="p-6 space-y-4">
                      <h2 className="font-semibold">Onde encontrar as credenciais</h2>
                      <div className="text-sm space-y-4 text-muted-foreground">
                        <CredentialHelp
                          name="Phone Number ID"
                          path="App → WhatsApp → Getting Started → Phone number ID"
                        />
                        <CredentialHelp
                          name="WABA ID"
                          path="App → WhatsApp → Getting Started → WhatsApp Business Account ID"
                        />
                        <CredentialHelp
                          name="Access Token"
                          path="App → WhatsApp → Getting Started → Temporary access token (ou System User Token para produção)"
                        />
                        <CredentialHelp
                          name="App Secret"
                          path="App → Configurações → Básicas → App Secret"
                        />
                        <CredentialHelp
                          name="Verify Token"
                          path="Você define este valor — use o que foi gerado automaticamente ou crie o seu"
                        />
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Testar */}
                <TabsContent value="send">
                  <div className="grid md:grid-cols-2 gap-4">
                    <MetaWhatsAppSender channelId={selectedChannel.id} />
                    <Card className="p-6 space-y-3">
                      <h2 className="font-semibold">Sobre o envio de teste</h2>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                        <li>O número de destino deve estar na <strong>lista de teste</strong> do app Meta (durante desenvolvimento)</li>
                        <li>Para enviar para qualquer número, o app precisa estar em <strong>modo Live</strong></li>
                        <li>Mensagens de texto só funcionam dentro da <strong>janela de 24h</strong> de uma conversa iniciada pelo cliente</li>
                        <li>Para iniciar uma conversa do zero, use um <strong>template HSM</strong> aprovado</li>
                        <li>Custo: gratuito até 1.000 conversas/mês iniciadas pelo cliente</li>
                      </ul>
                    </Card>
                  </div>
                </TabsContent>

                {/* Guia */}
                <TabsContent value="guide">
                  <Card className="p-6 space-y-6 text-sm">
                    <h2 className="font-semibold text-base">Guia de Configuração Meta WhatsApp</h2>

                    <Section title="1. Pré-requisitos">
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Conta no <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline">Meta for Developers <ExternalLink className="h-3 w-3 inline" /></a></li>
                        <li>App do tipo <strong>Business</strong> criado</li>
                        <li>Produto <strong>WhatsApp</strong> adicionado ao app</li>
                        <li>Número de telefone verificado no Meta Business Manager</li>
                      </ol>
                    </Section>

                    <Section title="2. Registrar o Webhook">
                      <p className="text-muted-foreground mb-2">No painel: <strong>WhatsApp → Configuração → Webhooks</strong></p>
                      <div className="bg-muted rounded p-3 font-mono text-xs space-y-1">
                        <p>URL: {webhookUrl}</p>
                        <p>Verify Token: {selectedChannel.meta_verify_token ?? '(ver aba Configurar)'}</p>
                      </div>
                      <p className="text-muted-foreground mt-2">Assine o campo: <code className="bg-muted px-1 rounded">messages</code></p>
                    </Section>

                    <Section title="3. Testar via API (curl)">
                      <pre className="bg-muted rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap">{`curl -X POST /api/whatsapp/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "5511987654321",
    "message": "Olá! Teste do CRM.",
    "channelId": "${selectedChannel.id}"
  }'`}</pre>
                    </Section>

                    <Section title="4. Receber mensagens (Webhook POST)">
                      <p className="text-muted-foreground">
                        Quando um cliente enviar uma mensagem, a Meta fará um POST para a URL do webhook.
                        O sistema irá automaticamente:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                        <li>Criar ou atualizar o contato</li>
                        <li>Criar ou reutilizar uma conversa aberta</li>
                        <li>Salvar a mensagem na tabela <code className="bg-muted px-1 rounded">messages</code></li>
                      </ul>
                    </Section>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function CredentialHelp({ name, path }: { name: string; path: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-xs">{path}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
