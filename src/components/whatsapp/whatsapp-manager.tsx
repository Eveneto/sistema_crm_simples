'use client';

/**
 * Componentes para configuração e uso do canal Meta WhatsApp Cloud API.
 *
 * Exports:
 *  - MetaChannelForm     — Formulário de criação/edição de canal (credenciais Meta)
 *  - MetaWhatsAppSender  — Envio de mensagem de teste
 *  - ChannelStatusCard   — Card de status do canal
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Send,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChannelData {
  id: string;
  name: string;
  is_connected: boolean;
  meta_phone_number_id: string | null;
  meta_display_phone: string | null;
  meta_verify_token: string | null;
}

interface FormValues {
  name: string;
  meta_phone_number_id: string;
  meta_waba_id: string;
  meta_access_token: string;
  meta_app_secret: string;
  meta_verify_token: string;
  meta_business_name: string;
  meta_display_phone: string;
}

// ─── MetaChannelForm ─────────────────────────────────────────────────────────

interface MetaChannelFormProps {
  /** Canal existente para edição — omitir para criação */
  channel?: ChannelData & { meta_waba_id?: string; meta_business_name?: string };
  onSuccess?: (channel: ChannelData) => void;
}

export function MetaChannelForm({ channel, onSuccess }: MetaChannelFormProps) {
  const isEditing = !!channel;

  const [values, setValues] = useState<FormValues>({
    name: channel?.name ?? '',
    meta_phone_number_id: channel?.meta_phone_number_id ?? '',
    meta_waba_id: (channel as any)?.meta_waba_id ?? '',
    meta_access_token: '',           // nunca pré-preencher token por segurança
    meta_app_secret: '',
    meta_verify_token: channel?.meta_verify_token ?? generateVerifyToken(),
    meta_business_name: (channel as any)?.meta_business_name ?? '',
    meta_display_phone: channel?.meta_display_phone ?? '',
  });

  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const set = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      // Na edição, campo em branco = não alterar; na criação, são obrigatórios
      const body: Record<string, string> = { ...values };
      if (isEditing) {
        if (!body.meta_access_token) delete body.meta_access_token;
        if (!body.meta_app_secret)   delete body.meta_app_secret;
      }

      const url = isEditing ? `/api/channels/${channel.id}` : '/api/channels';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Erro ao salvar canal');
      }

      setFeedback({ type: 'success', message: isEditing ? 'Canal atualizado!' : 'Canal criado com sucesso!' });
      onSuccess?.(data as ChannelData);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-1">
        {isEditing ? 'Editar Canal' : 'Novo Canal WhatsApp'}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Credenciais do{' '}
        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noreferrer"
          className="underline inline-flex items-center gap-1"
        >
          Meta for Developers
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do canal */}
        <Field label="Nome do canal" hint="Ex: Atendimento Principal">
          <Input value={values.name} onChange={set('name')} placeholder="Atendimento Principal" required />
        </Field>

        {/* Phone Number ID */}
        <Field
          label="Phone Number ID"
          hint="Meta for Developers → WhatsApp → Getting Started"
        >
          <Input
            value={values.meta_phone_number_id}
            onChange={set('meta_phone_number_id')}
            placeholder="123456789012345"
            className="font-mono"
            required={!isEditing}
          />
        </Field>

        {/* WABA ID */}
        <Field label="WhatsApp Business Account ID (WABA ID)" hint="Opcional, mas recomendado">
          <Input
            value={values.meta_waba_id}
            onChange={set('meta_waba_id')}
            placeholder="123456789012345"
            className="font-mono"
          />
        </Field>

        {/* Access Token */}
        <Field
          label={isEditing ? 'Access Token (deixe em branco para manter atual)' : 'Access Token'}
          hint="System User Token permanente recomendado para produção"
        >
          <div className="relative">
            <Input
              type={showToken ? 'text' : 'password'}
              value={values.meta_access_token}
              onChange={set('meta_access_token')}
              placeholder={isEditing ? '••••••••' : 'EAAxxxxxx...'}
              className="font-mono pr-10"
              required={!isEditing}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* App Secret */}
        <Field
          label={isEditing ? 'App Secret (deixe em branco para manter atual)' : 'App Secret'}
          hint="Meta for Developers → Configurações do App → App Secret. Usado para validar webhooks."
        >
          <div className="relative">
            <Input
              type={showSecret ? 'text' : 'password'}
              value={values.meta_app_secret}
              onChange={set('meta_app_secret')}
              placeholder={isEditing ? '••••••••' : 'abc123...'}
              className="font-mono pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowSecret((v) => !v)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* Verify Token */}
        <Field
          label="Verify Token"
          hint="Token que você define e cadastra no painel Meta ao registrar a URL do webhook"
        >
          <Input
            value={values.meta_verify_token}
            onChange={set('meta_verify_token')}
            placeholder="meu_verify_token_secreto"
            className="font-mono"
            required
          />
        </Field>

        {/* Nome do negócio */}
        <Field label="Nome do negócio" hint="Opcional — usado para exibição na interface">
          <Input
            value={values.meta_business_name}
            onChange={set('meta_business_name')}
            placeholder="Minha Empresa Ltda"
          />
        </Field>

        {/* Telefone de exibição */}
        <Field label="Telefone de exibição" hint="Opcional — ex: +55 11 91234-5678">
          <Input
            value={values.meta_display_phone}
            onChange={set('meta_display_phone')}
            placeholder="+55 11 91234-5678"
            className="font-mono"
          />
        </Field>

        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            {feedback.type === 'error' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : isEditing ? (
            'Salvar Alterações'
          ) : (
            'Criar Canal'
          )}
        </Button>
      </form>
    </Card>
  );
}

// ─── MetaWhatsAppSender ───────────────────────────────────────────────────────

interface MetaWhatsAppSenderProps {
  channelId?: string;
  onSuccess?: (wamid: string) => void;
}

export function MetaWhatsAppSender({ channelId, onSuccess }: MetaWhatsAppSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          message,
          ...(channelId ? { channelId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? 'Erro ao enviar');

      setFeedback({ type: 'success', message: `✅ Enviado! wamid: ${data.wamid}` });
      setPhoneNumber('');
      setMessage('');
      onSuccess?.(data.wamid);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao enviar',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Enviar Mensagem de Teste</h2>

      <form onSubmit={handleSend} className="space-y-4">
        <Field label="Número de Telefone" hint="Somente dígitos, com DDI+DDD — ex: 5511987654321">
          <Input
            type="tel"
            placeholder="5511987654321"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            className="font-mono"
          />
        </Field>

        <Field label="Mensagem" hint={`${message.length}/4096`}>
          <Textarea
            placeholder="Olá! Esta é uma mensagem de teste do CRM."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows={4}
            maxLength={4096}
            className="resize-none"
          />
        </Field>

        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            {feedback.type === 'error' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription className="font-mono text-xs break-all">{feedback.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={loading || !phoneNumber || !message} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar via Meta API
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

// ─── ChannelStatusCard ────────────────────────────────────────────────────────

interface ChannelStatusCardProps {
  channel: ChannelData;
  webhookUrl: string;
}

export function ChannelStatusCard({ channel, webhookUrl }: ChannelStatusCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${channel.is_connected ? 'bg-green-500' : 'bg-yellow-400'}`} />
        <span className="font-semibold">{channel.is_connected ? 'Canal ativo' : 'Canal configurado'}</span>
      </div>

      <div className="space-y-3 text-sm">
        <InfoRow label="Nome" value={channel.name} />
        {channel.meta_display_phone && (
          <InfoRow label="Telefone" value={channel.meta_display_phone} mono />
        )}
        {channel.meta_phone_number_id && (
          <InfoRow label="Phone Number ID" value={channel.meta_phone_number_id} mono />
        )}

        {/* Webhook URL */}
        <div>
          <p className="text-muted-foreground mb-1">Webhook URL</p>
          <div className="flex items-center gap-2 bg-muted rounded px-3 py-2">
            <code className="text-xs flex-1 break-all">{webhookUrl}</code>
            <button onClick={() => copy(webhookUrl, 'webhook')} className="shrink-0 text-muted-foreground hover:text-foreground">
              {copied === 'webhook' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Verify Token */}
        {channel.meta_verify_token && (
          <div>
            <p className="text-muted-foreground mb-1">Verify Token</p>
            <div className="flex items-center gap-2 bg-muted rounded px-3 py-2">
              <code className="text-xs flex-1 font-mono">{channel.meta_verify_token}</code>
              <button onClick={() => copy(channel.meta_verify_token!, 'verify')} className="shrink-0 text-muted-foreground hover:text-foreground">
                {copied === 'verify' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function generateVerifyToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}


interface WhatsAppSenderProps {
  instanceName?: string;
  onSuccess?: (messageId: string) => void;
}

export function WhatsAppSender({ instanceName = 'crm_instance', onSuccess }: WhatsAppSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !message) {
      setStatus({
        type: 'error',
        message: 'Preencha número e mensagem',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          message,
          instanceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      setStatus({
        type: 'success',
        message: `✅ Mensagem enviada! ID: ${data.messageId}`,
      });

      setPhoneNumber('');
      setMessage('');
      onSuccess?.(data.messageId);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Enviar Mensagem WhatsApp</h2>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Número de Telefone</label>
          <Input
            type="tel"
            placeholder="11987654321 ou 5511987654321"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: 11 dígitos (com DDD) ou 13+ com código do país
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mensagem</label>
          <Textarea
            placeholder="Escreva sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows={4}
            maxLength={4096}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{message.length}/4096 caracteres</p>
        </div>

        {status && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            {status.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={loading || !phoneNumber || !message} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

interface WhatsAppStatusProps {
  instanceName?: string;
}

export function WhatsAppStatus({ instanceName = 'crm_instance' }: WhatsAppStatusProps) {
  const [status, setStatus] = useState<{
    connected: boolean;
    phone?: string;
    lastUpdate?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular busca de status (implementar com sua API real)
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        // Substituir com endpoint real quando disponível
        const response = await fetch(`/api/whatsapp/status/${instanceName}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, [instanceName]);

  if (loading) {
    return (
      <Card className="p-6">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Status WhatsApp</h2>
      {status?.connected ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full" />
            <span className="font-medium">Conectado</span>
          </div>
          {status.phone && (
            <p className="text-sm text-gray-600">
              Telefone: <span className="font-mono">{status.phone}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded-full" />
            <span className="font-medium">Desconectado</span>
          </div>
          <p className="text-sm text-gray-600">Abra a Evolution API e escaneie o QR Code</p>
        </div>
      )}
    </Card>
  );
}

interface WhatsAppQRCodeProps {
  instanceName?: string;
}

export function WhatsAppQRCode({ instanceName = 'crm_instance' }: WhatsAppQRCodeProps) {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // Substituir com endpoint real quando disponível
        const response = await fetch(`/api/whatsapp/qrcode/${instanceName}`);
        if (response.ok) {
          const data = await response.json();
          setQRCode(data.qrCode);
        }
      } catch (error) {
        console.error('Erro ao buscar QR Code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
    const interval = setInterval(fetchQRCode, 5000); // Atualizar a cada 5s

    return () => clearInterval(interval);
  }, [instanceName]);

  const copyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">QR Code WhatsApp</h2>
      {qrCode ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              className="w-64 h-64 border border-gray-300 rounded-lg"
            />
          </div>
          <Button onClick={copyQRCode} variant="outline" className="w-full">
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar QR Code
              </>
            )}
          </Button>
          <p className="text-sm text-gray-600">Escaneie com seu telefone para conectar WhatsApp</p>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            QR Code não disponível. Verifique se a Evolution API está funcionando.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
