'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  WhatsAppSender,
  WhatsAppStatus,
  WhatsAppQRCode,
} from '@/components/whatsapp/whatsapp-manager';
import { MessageCircle, Settings, CheckCircle } from 'lucide-react';

export default function WhatsAppChannelPage() {
  const [instanceName, setInstanceName] = useState('crm_instance');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">Canal WhatsApp</h1>
          </div>
          <p className="text-gray-600">
            Configure e gerencie sua integração com WhatsApp via Evolution API
          </p>
        </div>

        {/* Alerts */}
        <div className="space-y-4 mb-8">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Evolution API deve estar rodando em localhost:3000 ou configurada externamente
            </AlertDescription>
          </Alert>
        </div>

        {/* Settings */}
        {showSettings && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Configurações</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome da Instância Evolution API
                </label>
                <Input
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="crm_instance"
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API Key (opcional)</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sua_api_key_aqui"
                  className="font-mono"
                />
              </div>

              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Fechar Configurações
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">
              <span className="hidden sm:inline">Status</span>
              <span className="sm:hidden">Sts</span>
            </TabsTrigger>
            <TabsTrigger value="qrcode">
              <span className="hidden sm:inline">QR Code</span>
              <span className="sm:hidden">QR</span>
            </TabsTrigger>
            <TabsTrigger value="send">
              <span className="hidden sm:inline">Enviar</span>
              <span className="sm:hidden">📤</span>
            </TabsTrigger>
            <TabsTrigger value="docs">
              <span className="hidden sm:inline">Guia</span>
              <span className="sm:hidden">?</span>
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WhatsAppStatus instanceName={instanceName} />
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Informações</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Instância</p>
                    <p className="text-gray-600 font-mono">{instanceName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Webhook URL</p>
                    <p className="text-gray-600 font-mono text-xs break-all">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/api/webhook/whatsapp`
                        : '/api/webhook/whatsapp'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Status</p>
                    <p className="text-yellow-600">⚠️ Conecte no QR Code primeiro</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qrcode" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WhatsAppQRCode instanceName={instanceName} />
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Como Conectar</h2>
                <ol className="space-y-3 text-sm list-decimal list-inside">
                  <li>Certifique-se que Evolution API está rodando</li>
                  <li>Abra WhatsApp no seu celular</li>
                  <li>Vá para Configurações → Aparelhos Conectados</li>
                  <li>Clique em &quot;Conectar um aparelho&quot;</li>
                  <li>Escaneie o QR Code ao lado</li>
                  <li>Aguarde a confirmação (pode levar alguns segundos)</li>
                </ol>
              </Card>
            </div>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WhatsAppSender instanceName={instanceName} />
              </div>
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Dicas</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Número deve estar conectado</li>
                  <li>✅ Máximo 4096 caracteres</li>
                  <li>✅ Precisa de DDD (11, 21, etc)</li>
                  <li>✅ Mensagens salvas automaticamente</li>
                  <li>✅ Suporta media em breve</li>
                </ul>
              </Card>
            </div>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Documentação Rápida</h2>
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">🚀 Começando</h3>
                  <ol className="space-y-2 ml-4 list-decimal">
                    <li>
                      Inicie Evolution API:{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">docker-compose up -d</code>
                    </li>
                    <li>
                      Acesse:{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
                    </li>
                    <li>Escaneie QR Code para conectar WhatsApp</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📤 Enviar Mensagem (API)</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`POST /api/whatsapp/send
Content-Type: application/json

{
  "phoneNumber": "11987654321",
  "message": "Olá!",
  "instanceName": "crm_instance"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📨 Webhook Recebido</h3>
                  <p>Você receberá automáticamente quando:</p>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>Mensagem é recebida</li>
                    <li>Contato é adicionado</li>
                    <li>Status de mensagem muda</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🔒 Segurança</h3>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Webhook token deve ser alterado em produção</li>
                    <li>API Key nunca exponha no frontend</li>
                    <li>Use HTTPS em produção</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📚 Mais Informações</h3>
                  <p>
                    Veja{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      PLANO_INTEGRACAO_WHATSAPP.md
                    </code>
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t">
          <p className="text-sm text-gray-600">Integração WhatsApp com Evolution API</p>
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? 'Esconder' : 'Mostrar'} Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
