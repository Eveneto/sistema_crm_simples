# 🐛 Issue: Erro "The default export is not a React Component" em /dashboard/contacts/new

**Status:** ✅ RESOLVIDO  
**Data:** 26/11/2025  
**Sprint:** Sprint 2  
**US Relacionada:** US-018 - Criar Novo Contato

---

## 📋 Descrição do Problema

Durante a implementação da US-018 (Criar Novo Contato), ocorreu um erro ao acessar a página `/dashboard/contacts/new`:

```
⨯ Error: The default export is not a React Component in page: "/dashboard/contacts/new"
```

---

## 🔍 Causa Raiz

O arquivo `src/app/dashboard/contacts/new/page.tsx` foi desfeito (undone) acidentalmente durante o desenvolvimento, resultando em um arquivo vazio ou inválido que não exportava um componente React válido.

---

## ✅ Solução Implementada

Recriado o arquivo `src/app/dashboard/contacts/new/page.tsx` com o conteúdo completo:

```typescript
import { ContactForm } from '@/components/contacts/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Novo Contato | CRM',
  description: 'Criar um novo contato',
};

export default function NewContactPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header com breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contacts">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Contato</h1>
          <p className="text-muted-foreground">
            Adicione um novo contato à sua base
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Contato</CardTitle>
          <CardDescription>
            Preencha os dados do novo contato. Campos com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Validação

- [x] Arquivo recriado com export default válido
- [x] TypeScript compila sem erros
- [x] Página renderiza corretamente
- [x] Formulário funciona corretamente
- [x] Navegação (breadcrumb) funciona

---

## 📚 Lições Aprendidas

1. **Sempre verificar exports default** em páginas Next.js App Router
2. **Revisar mudanças no Git** antes de fazer undo de arquivos
3. **Testar no navegador** após criar/modificar páginas

---

## 🎯 Impacto

- **Severidade:** Média (bloqueava funcionalidade)
- **Tempo para Resolver:** 5 minutos
- **User Stories Afetadas:** US-018
- **Arquivos Afetados:** 1

---

## 📝 Arquivos Relacionados

- `src/app/dashboard/contacts/new/page.tsx` - Página recriada
- `src/components/contacts/contact-form.tsx` - Formulário usado na página
- `docs/US-018_CRIAR_CONTATO.md` - Documentação da US

---

**Status Final:** ✅ RESOLVIDO - Página funcionando normalmente
