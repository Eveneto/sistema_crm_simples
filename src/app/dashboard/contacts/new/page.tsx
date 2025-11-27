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
