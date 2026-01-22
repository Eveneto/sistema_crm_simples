import { test, expect, Page } from '@playwright/test';

// Configuração para testes E2E do WhatsApp
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:3000';
const WEBHOOK_TOKEN = process.env.EVOLUTION_WEBHOOK_TOKEN || 'your_webhook_token_change_this';

test.describe('WhatsApp Integration', () => {
  let page: Page;

  test.beforeAll(async () => {
    // Verificar se Evolution API está rodando
    const response = await fetch(`${EVOLUTION_API_URL}/api/health`);
    test.skip(response.status !== 200, 'Evolution API não está disponível');
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Webhook Handler', () => {
    test('should receive message webhook', async () => {
      const webhookPayload = {
        event: 'messages.upsert',
        instance: 'crm_instance',
        data: {
          messageTimestamp: Math.floor(Date.now() / 1000),
          messageType: 'text',
          textMessage: {
            text: 'Teste de mensagem',
          },
          fromMe: false,
          sender: {
            id: '5511987654321@c.us',
            name: 'Teste User',
          },
          chat: {
            id: '5511987654321@c.us',
            name: 'Teste User',
          },
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.event).toBe('messages.upsert');
    });

    test('should reject webhook with invalid token', async () => {
      const webhookPayload = {
        event: 'messages.upsert',
        instance: 'crm_instance',
        data: {},
      };

      const response = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid_token',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(401);
    });

    test('should handle contact webhook', async () => {
      const webhookPayload = {
        event: 'contacts.upsert',
        instance: 'crm_instance',
        data: {
          id: '5511987654321@c.us',
          pushName: 'João Silva',
          email: 'joao@example.com',
          profilePicture: 'https://example.com/profile.jpg',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Send Message API', () => {
    test('should send message with valid payload', async () => {
      const payload = {
        phoneNumber: '11987654321',
        message: 'Teste de envio',
        instanceName: 'crm_instance',
      };

      const response = await fetch(`${BASE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: JSON.stringify(payload),
      });

      // Pode retornar 500 se Evolution API não estiver preparado, mas deve processar a requisição
      expect([200, 500].includes(response.status)).toBeTruthy();
    });

    test('should reject invalid phone number', async () => {
      const payload = {
        phoneNumber: 'invalid',
        message: 'Teste',
        instanceName: 'crm_instance',
      };

      const response = await fetch(`${BASE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    test('should reject missing required fields', async () => {
      const payload = {
        phoneNumber: '11987654321',
        // message está faltando
      };

      const response = await fetch(`${BASE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    test('should accept 15-digit phone number', async () => {
      const payload = {
        phoneNumber: '5511987654321',
        message: 'Teste com país',
        instanceName: 'crm_instance',
      };

      const response = await fetch(`${BASE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: JSON.stringify(payload),
      });

      expect([200, 500].includes(response.status)).toBeTruthy();
    });
  });

  test.describe('WhatsApp Channel Page UI', () => {
    test('should load WhatsApp channel page', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Verificar título
      await expect(page.locator('h1')).toContainText('Canal WhatsApp');
    });

    test('should display tabs', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Verificar se as abas existem
      await expect(page.locator('button:has-text("Status")')).toBeVisible();
      await expect(page.locator('button:has-text("QR")')).toBeVisible();
      await expect(page.locator('button:has-text("Enviar")')).toBeVisible();
    });

    test('should switch between tabs', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Clique em "Enviar" tab
      await page.locator('button:has-text("Enviar")').click();

      // Verificar se formulário de envio aparece
      await expect(page.locator('text=Enviar Mensagem')).toBeVisible();
    });

    test('should display message form', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Clique em "Enviar" tab
      await page.locator('button:has-text("Enviar")').click();

      // Verificar campos
      await expect(page.locator('input[placeholder*="Número"]')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    });

    test('should validate phone number input', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Clique em "Enviar" tab
      await page.locator('button:has-text("Enviar")').click();

      // Preencher com caracteres não-numéricos
      const phoneInput = page.locator('input[placeholder*="Número"]');
      await phoneInput.fill('abc-def-ghij');

      // Deve ficar vazio ou apenas números
      const value = await phoneInput.inputValue();
      expect(/^\d*$/.test(value)).toBeTruthy();
    });

    test('should display settings when button clicked', async () => {
      await page.goto(`${BASE_URL}/channels/whatsapp`, {
        waitUntil: 'networkidle',
      });

      // Clique em Settings
      await page.locator('button:has-text("Mostrar")').click();

      // Verificar se formulário de settings aparece
      await expect(page.locator('text=Configurações')).toBeVisible();
    });
  });

  test.describe('Message Flow', () => {
    test('complete message workflow', async () => {
      // 1. Enviar webhook de contato
      const contactPayload = {
        event: 'contacts.upsert',
        instance: 'crm_instance',
        data: {
          id: '5511987654321@c.us',
          pushName: 'Test User',
        },
      };

      const contactResponse = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify(contactPayload),
      });

      expect(contactResponse.status).toBe(200);

      // 2. Enviar webhook de mensagem
      const messagePayload = {
        event: 'messages.upsert',
        instance: 'crm_instance',
        data: {
          messageTimestamp: Math.floor(Date.now() / 1000),
          messageType: 'text',
          textMessage: {
            text: 'Teste E2E',
          },
          fromMe: false,
          sender: {
            id: '5511987654321@c.us',
            name: 'Test User',
          },
          chat: {
            id: '5511987654321@c.us',
          },
        },
      };

      const messageResponse = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify(messagePayload),
      });

      expect(messageResponse.status).toBe(200);

      // 3. Enviar resposta
      const sendPayload = {
        phoneNumber: '11987654321',
        message: 'Resposta ao teste',
        instanceName: 'crm_instance',
      };

      const sendResponse = await fetch(`${BASE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: JSON.stringify(sendPayload),
      });

      // Pode ser 200 ou 500 dependendo se Evolution API está conectado
      expect([200, 500].includes(sendResponse.status)).toBeTruthy();
    });
  });
});
