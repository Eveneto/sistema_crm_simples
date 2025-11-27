import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Mail, Phone, Building2, Briefcase, Calendar, Pencil } from 'lucide-react';
import Link from 'next/link';
import { DeleteContactButton } from '@/components/contacts/delete-contact-button';

export const metadata = {
  title: 'Detalhes do Contato | CRM Simplificado',
  description: 'Visualize as informações completas do contato',
};

export default async function ContactDetailPage({
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

  // Formatar data
  const createdAt = new Date(contactData.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const updatedAt = new Date(contactData.updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb e Ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/contacts">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{contactData.name}</h1>
            <p className="text-sm text-muted-foreground">
              {contactData.custom_fields?.position || 'Sem cargo definido'}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/contacts/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteContactButton contactId={params.id} contactName={contactData.name} />
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>Dados principais do contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactData.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${contactData.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contactData.email}
                  </a>
                </div>
              </div>
            )}

            {contactData.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <a
                    href={`tel:${contactData.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contactData.phone}
                  </a>
                </div>
              </div>
            )}

            {contactData.custom_fields?.company && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Empresa</p>
                  <p className="text-sm text-muted-foreground">
                    {contactData.custom_fields.company}
                  </p>
                </div>
              </div>
            )}

            {contactData.custom_fields?.position && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cargo</p>
                  <p className="text-sm text-muted-foreground">
                    {contactData.custom_fields.position}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags e Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Tags e Informações</CardTitle>
            <CardDescription>Categorias e metadados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tags */}
            {contactData.tags && contactData.tags.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {contactData.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
              </div>
            )}

            {/* Datas */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Última atualização</p>
                  <p className="text-sm text-muted-foreground">{updatedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notas */}
      {contactData.custom_fields?.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>Observações e anotações sobre o contato</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {contactData.custom_fields.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
