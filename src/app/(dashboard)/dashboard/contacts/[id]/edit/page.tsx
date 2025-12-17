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
import { Loader2 } from 'lucide-react';
import { ModalTransition } from '@/components/animations/modal-transition';

interface ContactEditPageProps {
  params: {
    id: string;
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
 * Contact Edit Page
 * Displays a modal for editing a contact
 */
export default function ContactEditPage({ params }: ContactEditPageProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

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
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>Atualize os dados do contato abaixo</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <ContactForm
              mode="edit"
              contactId={params.id}
              initialData={contact}
              onSuccess={handleSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </ModalTransition>
  );
}
