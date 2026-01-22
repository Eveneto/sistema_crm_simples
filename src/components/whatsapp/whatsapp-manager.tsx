'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

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
