# 🔧 Detalhes Técnicos - Correção de Links de Autenticação

## Problema Original

Os links de recuperação de senha e validação de email eram gerados com `window.location.origin`, que em produção apontava para `localhost`:

```typescript
// ❌ ANTES (não funcionava em produção)
redirectTo: `${window.location.origin}/update-password`;

// Em produção, resultava em:
// http://localhost:3000/update-password ❌ (não existe)
```

## Solução Implementada

### 1. Função Utilitária de URL

**Arquivo**: `src/lib/utils/url.ts`

```typescript
export function getAppUrl(): string {
  // Servidor
  if (typeof window === 'undefined') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    return appUrl || 'https://sistema-crm-simples-zeb2.vercel.app';
  }

  // Cliente
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl || window.location.origin;
}

export function getCallbackUrl(path: string): string {
  const baseUrl = getAppUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
```

**Lógica**:

- Prioridade: `NEXT_PUBLIC_APP_URL` > `window.location.origin` (cliente) ou fallback (servidor)
- Normaliza o path para começar com `/`
- Retorna URL completa e válida

### 2. Atualização do Reset de Senha

**Arquivo**: `src/app/(auth)/reset-password/page.tsx`

```typescript
// ✅ DEPOIS
const redirectUrl = getCallbackUrl('/update-password');
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: redirectUrl,
});
```

**Resultado**:

- Local: `http://localhost:3000/update-password`
- Produção: `https://sistema-crm-simples-zeb2.vercel.app/update-password`

### 3. Atualização do Registro

**Arquivo**: `src/app/(auth)/register/page.tsx`

```typescript
// ✅ ADICIONADO
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: getCallbackUrl('/login'),
    data: { full_name: fullName, role: 'agent' },
  },
});
```

**Resultado**:

- Email de confirmação aponta para URL correta
- Após confirmar, usuário é redirecionado para login

### 4. Configuração de Ambiente

**Arquivo**: `.env.example`

```env
# URL da aplicação (para webhooks e links de email)
# IMPORTANTE: Ajuste para produção!
# Exemplo produção: https://sistema-crm-simples-zeb2.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota**: Variável é `NEXT_PUBLIC_*` porque é usada no cliente (browser).

## Fluxo de Funcionamento

### Recuperação de Senha

```
1. User acessa /reset-password
2. Digita email e clica em "Enviar Link"
3. Sistema chama: supabase.auth.resetPasswordForEmail(email, {
     redirectTo: getCallbackUrl('/update-password')
   })
4. Supabase envia email com link:
   - Local: http://localhost:3000/update-password?token=xxx
   - Produção: https://sistema-crm-simples-zeb2.vercel.app/update-password?token=xxx
5. User clica no link
6. Página /update-password abre e valida o token
7. User atualiza a senha
8. Redireciona para /login
```

### Confirmação de Email (Sign Up)

```
1. User acessa /register
2. Preenche formulário e clica em "Criar Conta"
3. Sistema chama: supabase.auth.signUp({
     email,
     password,
     options: { emailRedirectTo: getCallbackUrl('/login') }
   })
4. Supabase envia email de confirmação com link:
   - Local: http://localhost:3000/login?token=xxx
   - Produção: https://sistema-crm-simples-zeb2.vercel.app/login?token=xxx
5. User clica no link para confirmar email
6. Supabase valida e marca email como confirmado
7. User é redirecionado para /login
8. Agora pode fazer login com a nova conta
```

## Configuração no Vercel

**Via Dashboard**:

1. https://vercel.com/dashboard
2. Selecione projeto
3. Settings → Environment Variables
4. Add New:
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://sistema-crm-simples-zeb2.vercel.app`
   - Environments: Production, Preview, Development

**Via CLI**:

```bash
vercel env add NEXT_PUBLIC_APP_URL
# Selecione Production
# Valor: https://sistema-crm-simples-zeb2.vercel.app
```

**Via GitHub Actions** (se aplicável):

```bash
# GitHub → Settings → Secrets and variables → Actions
# New repository secret
Name: NEXT_PUBLIC_APP_URL
Value: https://sistema-crm-simples-zeb2.vercel.app
```

## Testes Recomendados

### Local (npm run dev)

```bash
# 1. Teste de Reset de Senha
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Teste de Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"Test123!"}'
```

### Produção (após deploy)

1. Acessar: `https://sistema-crm-simples-zeb2.vercel.app/reset-password`
2. Digitar email
3. Verificar email recebido
4. **O link deve conter a URL correta** (sem localhost!)
5. Clicar no link e validar que funciona

## Variáveis de Ambiente Relacionadas

```env
# Autenticação
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_privada

# URLs
NEXT_PUBLIC_APP_URL=https://sistema-crm-simples-zeb2.vercel.app

# Node
NODE_ENV=production
```

## Benefícios da Solução

✅ **Seguro**: URL não é hardcoded  
✅ **Flexível**: Funciona em qualquer ambiente (local, staging, produção)  
✅ **Reutilizável**: Função pode ser usada em outras features  
✅ **Fácil de manter**: Uma única fonte de verdade  
✅ **Compatível**: Funciona com Supabase e qualquer provedor de auth

## Referências

- [Supabase - Password Reset](https://supabase.com/docs/guides/auth/passwordless/password-reset)
- [Supabase - Email Verification](https://supabase.com/docs/guides/auth/managing-user-data#user-metadata)
- [Vercel - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js - Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
