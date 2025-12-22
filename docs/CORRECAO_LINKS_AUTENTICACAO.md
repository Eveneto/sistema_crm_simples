# 🔐 Correção: Links de Recuperação de Senha e Validação de Email

## Problema

Os links de recuperação de senha e validação de email estavam sendo gerados com `localhost`, o que não funciona em produção.

## Solução

Implementamos uma solução que usa a variável de ambiente `NEXT_PUBLIC_APP_URL` para gerar os links corretos tanto em desenvolvimento quanto em produção.

### Arquivos Modificados

1. **`src/lib/utils/url.ts`** (NOVO)
   - Função `getAppUrl()`: Retorna a URL base da aplicação
   - Função `getCallbackUrl(path)`: Gera URLs de callback com a base correta

2. **`src/app/(auth)/reset-password/page.tsx`**
   - Usa `getCallbackUrl('/update-password')` em vez de `window.location.origin`

## Configuração

### Local (Desenvolvimento)

`.env.local` já contém:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Produção (Vercel)

Você precisa definir a variável de ambiente no Vercel:

#### Via Dashboard Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: `sistema-crm-simples`
3. Vá para: **Settings → Environment Variables**
4. Adicione:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://sistema-crm-simples-zeb2.vercel.app`
   - **Environments**: Production, Preview, Development

#### Via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_APP_URL
# Selecione Production
# Insira: https://sistema-crm-simples-zeb2.vercel.app
```

#### Via GitHub Actions

Se você usar GitHub Actions, adicione a variável nos **GitHub Secrets**:

```bash
# No seu repositório GitHub
# Settings → Secrets and variables → Actions
# New repository secret

Nome: NEXT_PUBLIC_APP_URL
Valor: https://sistema-crm-simples-zeb2.vercel.app
```

## Como Funciona

### Fluxo de Recuperação de Senha

1. Usuário clica em "Esqueceu a senha?"
2. Digita seu email e clica em "Enviar Link de Recuperação"
3. Sistema envia email com link contendo token do Supabase
4. Link aponta para: `https://sistema-crm-simples-zeb2.vercel.app/update-password?token=xxx`
5. Usuário atualiza a senha
6. Redireciona para login

### Fluxo de Confirmação de Email (Registro)

1. Usuário cria nova conta
2. Sistema envia email com link de confirmação
3. Link contém token do Supabase
4. Após clicar, email fica validado no Supabase

## Verificação

Para verificar se está funcionando:

### Local

```bash
npm run dev
# Testar em http://localhost:3000/reset-password
```

### Produção

Após fazer deploy:

1. Acesse https://sistema-crm-simples-zeb2.vercel.app/reset-password
2. Digite um email
3. Verifique o email recebido
4. O link deve conter a URL correta (sem localhost)

## Variáveis de Ambiente Relacionadas

```env
# URL do app (para links de callback)
NEXT_PUBLIC_APP_URL=https://sistema-crm-simples-zeb2.vercel.app

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Testes Recomendados

- [ ] Login funciona
- [ ] Recuperação de senha funciona no localhost
- [ ] Email de recuperação recebido com link correto
- [ ] Link de recuperação abre update-password
- [ ] Senha é atualizada com sucesso
- [ ] Teste completo em produção

## Recursos

- [Documentação Supabase - Password Reset](https://supabase.com/docs/guides/auth/passwordless/password-reset)
- [Documentação Vercel - Environment Variables](https://vercel.com/docs/projects/environment-variables)
