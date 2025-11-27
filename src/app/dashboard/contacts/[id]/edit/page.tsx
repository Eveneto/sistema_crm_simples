import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ContactForm } from '@/components/contacts/contact-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ContactFormData } from '@/lib/validations/contact';

export const metadata = {
  title: 'Editar Contato | CRM Simplificado',
  description: 'Edite as informações do contato',
};

export default async function EditContactPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar contato
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !contact) {
    notFound();
  }

  // Type assertion para resolver problemas do Supabase types
  const contactData: any = contact;

  // Preparar dados iniciais para o formulário
  const initialData: Partial<ContactFormData> = {
    name: contactData.name,
    email: contactData.email || '',
    phone: contactData.phone || '',
    company: contactData.custom_fields?.company || '',
    position: contactData.custom_fields?.position || '',
    tags: contactData.tags || [],
    notes: contactData.custom_fields?.notes || '',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contacts">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Contato</h1>
          <p className="text-sm text-muted-foreground">
            Atualize as informações de {contactData.name}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Contato</CardTitle>
          <CardDescription>
            Atualize os dados do contato. Clique em &quot;Salvar Alterações&quot; quando terminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            mode="edit"
            initialData={initialData}
            contactId={params.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
