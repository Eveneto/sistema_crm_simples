import { Suspense } from 'react';
import { ContactsList } from '@/components/contacts/contacts-list';
import { ContactsListSkeleton } from '@/components/contacts/contacts-list-skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Contatos | CRM',
  description: 'Gerencie seus contatos',
};

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes e leads
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/contacts/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Contato
          </Link>
        </Button>
      </div>

      {/* Lista de Contatos */}
      <Suspense fallback={<ContactsListSkeleton />}>
        <ContactsList />
      </Suspense>
    </div>
  );
}
