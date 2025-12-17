'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContactForm } from '@/components/contacts/contact-form';
import { DeleteContactButton } from '@/components/contacts/delete-contact-button';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ModalTransition } from '@/components/animations/modal-transition';

interface ContactDetailPageProps {
  params: {
    id: string;
  };
  searchParams: {
    edit?: string;
  };
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Contact Detail/Edit Page
 * Displays contact details in a modal
 * Allows editing when ?edit=true is in the query string
 */
export default function ContactDetailPage({ params, searchParams }: ContactDetailPageProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const isEditMode = searchParams.edit === 'true';

  // Fetch contact details
  const {
    data: contact,
    isLoading,
    error,
  } = useQuery<Contact>({
    queryKey: ['contact', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${params.id}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar contato');
      }
      return response.json();
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleSuccess = () => {
    setIsOpen(false);
    router.push('/dashboard/contacts');
  };

  const handleEditClick = () => {
    router.push(`/dashboard/contacts/${params.id}?edit=true`);
  };

  if (isLoading) {
    return (
      <ModalTransition>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </DialogContent>
        </Dialog>
      </ModalTransition>
    );
  }

  if (error || !contact) {
    return (
      <ModalTransition>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Erro</DialogTitle>
              <DialogDescription>Não foi possível carregar o contato</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </ModalTransition>
    );
  }

  return (
    <ModalTransition>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Contato' : 'Detalhes do Contato'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Atualize os dados do contato abaixo'
                : `${contact.name} - ${contact.email || 'Sem email'}`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isEditMode ? (
              <ContactForm
                mode="edit"
                contactId={params.id}
                initialData={contact}
                onSuccess={handleSuccess}
              />
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-base">{contact.name}</p>
                  </div>

                  {contact.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base break-all">{contact.email}</p>
                    </div>
                  )}

                  {contact.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p className="text-base">{contact.phone}</p>
                    </div>
                  )}

                  {contact.company && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                      <p className="text-base">{contact.company}</p>
                    </div>
                  )}

                  {contact.position && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                      <p className="text-base">{contact.position}</p>
                    </div>
                  )}

                  {contact.tags && contact.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notas</p>
                      <p className="text-base whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <p>Criado em: {new Date(contact.created_at).toLocaleDateString('pt-BR')}</p>
                    <p>Atualizado em: {new Date(contact.updated_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleEditClick} className="flex-1">
                    Editar
                  </Button>
                  <DeleteContactButton contactId={params.id} onSuccess={handleSuccess} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ModalTransition>
  );
}
