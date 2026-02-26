/**
 * Meta WhatsApp Cloud API — Service Library
 *
 * Documentação oficial: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Responsabilidades:
 *  - Enviar mensagens de texto, mídia e template via Graph API
 *  - Verificar assinatura HMAC-SHA256 dos webhooks
 *  - Parsear e normalizar payloads de webhook da Meta
 */

import crypto from 'crypto';

// ─────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────

export const META_API_BASE = 'https://graph.facebook.com';

function getConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
    apiVersion: process.env.WHATSAPP_API_VERSION ?? 'v19.0',
  };
}

// ─────────────────────────────────────────
// Tipos — Payloads de envio
// ─────────────────────────────────────────

export interface MetaTextMessage {
  to: string;           // E.164 sem "+" — ex: "5511987654321"
  body: string;
  previewUrl?: boolean;
}

export interface MetaMediaMessage {
  to: string;
  type: 'image' | 'video' | 'audio' | 'document';
  link: string;         // URL pública da mídia
  caption?: string;
  filename?: string;    // Apenas para document
}

export interface MetaTemplateComponent {
  type: 'body' | 'header' | 'button';
  parameters: Array<{ type: 'text'; text: string } | { type: 'image'; image: { link: string } }>;
}

export interface MetaTemplateMessage {
  to: string;
  templateName: string;
  languageCode: string; // ex: "pt_BR"
  components?: MetaTemplateComponent[];
}

export interface MetaReactionMessage {
  to: string;
  messageId: string;    // wamid do message original
  emoji: string;
}

// ─────────────────────────────────────────
// Tipos — Payloads de webhook recebidos
// ─────────────────────────────────────────

export interface MetaWebhookPayload {
  object: 'whatsapp_business_account';
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;   // WABA ID
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  value: MetaWebhookValue;
  field: 'messages';
}

export interface MetaWebhookValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: MetaWebhookContact[];
  messages?: MetaWebhookMessage[];
  statuses?: MetaWebhookStatus[];
  errors?: MetaWebhookError[];
}

export interface MetaWebhookContact {
  profile: { name: string };
  wa_id: string;  // número sem "+"
}

export interface MetaWebhookMessage {
  from: string;           // número do remetente sem "+"
  id: string;             // wamid: "wamid.xxx"
  timestamp: string;      // unix timestamp em string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'reaction' | 'location' | 'unsupported';
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string; voice?: boolean };
  document?: { id: string; filename?: string; mime_type: string; sha256: string; caption?: string };
  sticker?: { id: string; mime_type: string; sha256: string; animated: boolean };
  reaction?: { message_id: string; emoji: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  context?: { from: string; id: string };  // mensagem citada
}

export interface MetaWebhookStatus {
  id: string;           // wamid
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: MetaWebhookError[];
}

export interface MetaWebhookError {
  code: number;
  title: string;
  message?: string;
  error_data?: { details: string };
}

// ─────────────────────────────────────────
// Tipos — Resposta normalizada
// ─────────────────────────────────────────

export interface NormalizedMessage {
  wamid: string;
  from: string;             // número E.164 sem "+"
  fromName: string | null;
  timestamp: Date;
  type: MetaWebhookMessage['type'];
  text: string | null;
  mediaId: string | null;
  mediaCaption: string | null;
  mediaFilename: string | null;
  quotedMessageId: string | null;
  phoneNumberId: string;
}

export interface NormalizedStatus {
  wamid: string;
  status: MetaWebhookStatus['status'];
  recipientId: string;
  timestamp: Date;
}

export interface ParsedWebhook {
  messages: NormalizedMessage[];
  statuses: NormalizedStatus[];
}

// ─────────────────────────────────────────
// Segurança — Verificação de assinatura
// ─────────────────────────────────────────

/**
 * Verifica a assinatura HMAC-SHA256 enviada pela Meta no header X-Hub-Signature-256.
 * DEVE ser chamada antes de processar qualquer payload de webhook.
 *
 * @param rawBody   Buffer do body cru (não parseado)
 * @param signature Valor do header X-Hub-Signature-256 (inclui o prefixo "sha256=")
 */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const { appSecret } = getConfig();

  if (!appSecret) {
    // Em desenvolvimento sem APP_SECRET configurado, permite passar
    if (process.env.NODE_ENV === 'development') {
      console.warn('[meta-whatsapp] WHATSAPP_APP_SECRET não configurado. Assinatura não verificada.');
      return true;
    }
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const receivedSignature = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  // Comparação de tempo constante para evitar timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Valida o hub.challenge no registro do webhook (requisição GET da Meta).
 *
 * @returns O valor de hub.challenge se o token bater, null caso contrário
 */
export function verifyWebhookChallenge(
  mode: string,
  token: string,
  challenge: string
): string | null {
  const { verifyToken } = getConfig();

  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  return null;
}

// ─────────────────────────────────────────
// Parsing de webhook
// ─────────────────────────────────────────

/**
 * Parseia o payload bruto da Meta e retorna mensagens e status normalizados.
 */
export function parseWebhookPayload(payload: MetaWebhookPayload): ParsedWebhook {
  const messages: NormalizedMessage[] = [];
  const statuses: NormalizedStatus[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      // Mapa de contato para lookup por número
      const contactMap = new Map<string, string>();
      for (const contact of value.contacts ?? []) {
        contactMap.set(contact.wa_id, contact.profile?.name ?? '');
      }

      // Mensagens recebidas
      for (const msg of value.messages ?? []) {
        const text =
          msg.text?.body ??
          msg.image?.caption ??
          msg.video?.caption ??
          msg.document?.caption ??
          null;

        const mediaId =
          msg.image?.id ??
          msg.video?.id ??
          msg.audio?.id ??
          msg.document?.id ??
          msg.sticker?.id ??
          null;

        messages.push({
          wamid: msg.id,
          from: msg.from,
          fromName: contactMap.get(msg.from) ?? null,
          timestamp: new Date(Number(msg.timestamp) * 1000),
          type: msg.type,
          text,
          mediaId,
          mediaCaption: msg.image?.caption ?? msg.video?.caption ?? msg.document?.caption ?? null,
          mediaFilename: msg.document?.filename ?? null,
          quotedMessageId: msg.context?.id ?? null,
          phoneNumberId: value.metadata.phone_number_id,
        });
      }

      // Status de mensagens enviadas
      for (const status of value.statuses ?? []) {
        statuses.push({
          wamid: status.id,
          status: status.status,
          recipientId: status.recipient_id,
          timestamp: new Date(Number(status.timestamp) * 1000),
        });
      }
    }
  }

  return { messages, statuses };
}

// ─────────────────────────────────────────
// Envio de mensagens
// ─────────────────────────────────────────

interface GraphApiSuccess {
  messaging_product: 'whatsapp';
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
}

interface GraphApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

/**
 * Chama a Graph API para enviar uma mensagem.
 * Retorna o wamid da mensagem enviada.
 */
async function callGraphAPI(
  phoneNumberId: string,
  accessToken: string,
  apiVersion: string,
  body: object
): Promise<string> {
  const url = `${META_API_BASE}/${apiVersion}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as GraphApiSuccess | GraphApiError;

  if (!response.ok || 'error' in json) {
    const err = (json as GraphApiError).error;
    throw new Error(
      `Meta Graph API error [${err?.code ?? response.status}]: ${err?.message ?? response.statusText}`
    );
  }

  const success = json as GraphApiSuccess;
  return success.messages[0]?.id ?? '';
}

/**
 * Envia uma mensagem de texto simples.
 * @returns wamid da mensagem enviada
 */
export async function sendTextMessage(
  params: MetaTextMessage,
  overrides?: { phoneNumberId?: string; accessToken?: string }
): Promise<string> {
  const config = getConfig();
  const phoneNumberId = overrides?.phoneNumberId ?? config.phoneNumberId;
  const accessToken = overrides?.accessToken ?? config.accessToken;

  return callGraphAPI(phoneNumberId, accessToken, config.apiVersion, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'text',
    text: {
      preview_url: params.previewUrl ?? false,
      body: params.body,
    },
  });
}

/**
 * Envia uma mensagem com mídia (imagem, vídeo, áudio, documento).
 * @returns wamid da mensagem enviada
 */
export async function sendMediaMessage(
  params: MetaMediaMessage,
  overrides?: { phoneNumberId?: string; accessToken?: string }
): Promise<string> {
  const config = getConfig();
  const phoneNumberId = overrides?.phoneNumberId ?? config.phoneNumberId;
  const accessToken = overrides?.accessToken ?? config.accessToken;

  const mediaObject: Record<string, unknown> = { link: params.link };
  if (params.caption) mediaObject.caption = params.caption;
  if (params.filename && params.type === 'document') mediaObject.filename = params.filename;

  return callGraphAPI(phoneNumberId, accessToken, config.apiVersion, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: params.type,
    [params.type]: mediaObject,
  });
}

/**
 * Envia uma mensagem de template (HSM).
 * Obrigatório para iniciar conversa com um contato (janela de 24h não aberta).
 * @returns wamid da mensagem enviada
 */
export async function sendTemplateMessage(
  params: MetaTemplateMessage,
  overrides?: { phoneNumberId?: string; accessToken?: string }
): Promise<string> {
  const config = getConfig();
  const phoneNumberId = overrides?.phoneNumberId ?? config.phoneNumberId;
  const accessToken = overrides?.accessToken ?? config.accessToken;

  return callGraphAPI(phoneNumberId, accessToken, config.apiVersion, {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: params.components ?? [],
    },
  });
}

/**
 * Marca uma mensagem como lida (double-check azul).
 */
export async function markAsRead(
  wamid: string,
  overrides?: { phoneNumberId?: string; accessToken?: string }
): Promise<void> {
  const config = getConfig();
  const phoneNumberId = overrides?.phoneNumberId ?? config.phoneNumberId;
  const accessToken = overrides?.accessToken ?? config.accessToken;

  const url = `${META_API_BASE}/${config.apiVersion}/${phoneNumberId}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: wamid,
    }),
  });
}

/**
 * Obtém a URL de download de uma mídia pelo mediaId.
 * Necessário para baixar imagens/documentos recebidos via webhook.
 */
export async function getMediaUrl(
  mediaId: string,
  overrides?: { accessToken?: string }
): Promise<string> {
  const config = getConfig();
  const accessToken = overrides?.accessToken ?? config.accessToken;

  const response = await fetch(`${META_API_BASE}/${config.apiVersion}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter URL da mídia: ${response.statusText}`);
  }

  const json = (await response.json()) as { url: string };
  return json.url;
}
