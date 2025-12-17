'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContactForm } from '@/components/contacts/contact-form';
import { ModalTransition } from '@/components/animations/modal-transition';

/**
 * Create Contact Modal (Interceptor Route)
 * Shows a modal to create a new contact
 * Automatically opens on page load
 */
export default function CreateContactPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleSuccess = () => {
    setIsOpen(false);
    router.push('/dashboard/contacts');
  };

  return (
    <ModalTransition>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Contato</DialogTitle>
            <DialogDescription>Preencha os dados do novo contato abaixo</DialogDescription>
          </DialogHeader>

          <div className="mt-4 pr-4">
            <ContactForm mode="create" onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </ModalTransition>
  );
}
