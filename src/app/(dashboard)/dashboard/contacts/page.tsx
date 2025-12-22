/**
 * Dashboard - Contacts Page
 * Manage and view all contacts
 *
 * Features:
 * - List all contacts with search and filtering
 * - Create, edit, delete contacts
 * - Tag filtering
 * - Pagination
 * - Integrated with React Query for performance
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Search, Plus, AlertCircle } from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts-query';
import { useDebounce } from '@/hooks/use-debounce';
import { ContactCard } from '@/components/contacts/contact-card';
import { ContactsListSkeleton } from '@/components/contacts/contacts-list-skeleton';
import { ContactForm } from '@/components/contacts/contact-form';
import { TagFilter } from '@/components/contacts/tag-filter';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/animations/page-transition';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search, 300);

  // React Query hook with automatic caching (5 minutes)
  const {
    data: contactsResponse,
    isLoading,
    error,
  } = useContacts({
    page,
    search: debouncedSearch,
    limit: 20,
  });

  // Debug logs
  useEffect(() => {
    console.log('[ContactsPage] contactsResponse:', contactsResponse);
    console.log('[ContactsPage] isLoading:', isLoading);
    console.log('[ContactsPage] error:', error);
  }, [contactsResponse, isLoading, error]);

  const contacts = useMemo(() => {
    const result = contactsResponse?.contacts || [];
    console.log('[ContactsPage] contacts memoized:', result);
    return result;
  }, [contactsResponse]);

  const pagination = useMemo(() => {
    const result = contactsResponse?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasPrev: false,
      hasNext: false,
    };
    console.log('[ContactsPage] pagination memoized:', result);
    return result;
  }, [contactsResponse]);

  // Extract unique tags from contacts
  const extractedTags = useMemo(() => {
    console.log('[ContactsPage] Extracting tags from', contacts.length, 'contacts');
    const tags = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach((tag) => {
          tags.add(tag);
        });
      }
    });
    const result = Array.from(tags).sort();
    console.log('[ContactsPage] extractedTags:', result);
    return result;
  }, [contacts]);

  // Filter contacts by selected tags
  const filteredContacts = useMemo(() => {
    console.log(
      '[ContactsPage] Filtering contacts. selectedTags:',
      selectedTags,
      'contacts:',
      contacts.length
    );
    if (!selectedTags || selectedTags.length === 0) {
      console.log('[ContactsPage] No tags selected, returning all contacts');
      return contacts;
    }

    const result = contacts.filter((contact) => {
      if (!contact.tags || contact.tags.length === 0) return false;
      return selectedTags.some((tag) => contact.tags?.includes(tag));
    });

    console.log('[ContactsPage] filteredContacts:', result.length);
    return result;
  }, [contacts, selectedTags]);

  // Abrir modal se tiver ?modal=new na URL
  useEffect(() => {
    if (searchParams?.get('modal') === 'new') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to page 1 when searching
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    setPage(1); // Reset to page 1 when filtering
  };

  const handleContactDeleted = () => {
    toast({
      title: 'Sucesso',
      description: 'Contato deletado com sucesso',
    });
  };

  const handleCreateSuccess = () => {
    console.log('[ContactsPage] handleCreateSuccess called');

    // Invalidar cache de contatos para forçar refetch
    queryClient.invalidateQueries({
      queryKey: ['contacts'],
    });

    console.log('[ContactsPage] Cache invalidated, forcing refetch');

    setIsCreateModalOpen(false);
    router.push('/dashboard/contacts');

    toast({
      title: 'Sucesso',
      description: 'Contato criado com sucesso',
    });
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <ErrorBoundary sectionName="Contatos">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
                <p className="text-muted-foreground mt-2">Gerencie todos os seus contatos</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>

            <Card className="p-6">
              <ContactsListSkeleton />
            </Card>
          </div>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar contatos';
    return (
      <PageTransition>
        <ErrorBoundary sectionName="Contatos">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
                <p className="text-muted-foreground mt-2">Gerencie todos os seus contatos</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  // No contacts state
  if (!contacts || (contacts.length === 0 && !debouncedSearch)) {
    console.log(
      '[ContactsPage] No contacts state: contacts=',
      contacts,
      'debouncedSearch=',
      debouncedSearch
    );
    return (
      <PageTransition>
        <ErrorBoundary sectionName="Contatos">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
                <p className="text-muted-foreground mt-2">Gerencie todos os seus contatos</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>

            <Card className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum contato encontrado</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Comece adicionando seu primeiro contato
              </p>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Contato
              </Button>
            </Card>
          </div>

          {/* Modal de Criar Contato */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Contato</DialogTitle>
                <DialogDescription>Preencha os dados do novo contato abaixo</DialogDescription>
              </DialogHeader>

              <div className="mt-4 pr-4">
                <ContactForm
                  mode="create"
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCreateCancel}
                />
              </div>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  // No results state (from search)
  if (!filteredContacts || filteredContacts.length === 0) {
    console.log('[ContactsPage] No results state: filteredContacts=', filteredContacts);
    return (
      <PageTransition>
        <ErrorBoundary sectionName="Contatos">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
                <p className="text-muted-foreground mt-2">Gerencie todos os seus contatos</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar contatos..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </Card>

              {extractedTags && extractedTags.length > 0 && (
                <Card className="p-4">
                  <TagFilter value={selectedTags} onChange={handleTagChange} tags={extractedTags} />
                </Card>
              )}

              <Card className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum contato encontrado</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Tente ajustar sua busca ou filtros
                </p>
              </Card>
            </div>
          </div>

          {/* Modal de Criar Contato */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Contato</DialogTitle>
                <DialogDescription>Preencha os dados do novo contato abaixo</DialogDescription>
              </DialogHeader>

              <div className="mt-4 pr-4">
                <ContactForm
                  mode="create"
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCreateCancel}
                />
              </div>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  // Main content
  return (
    <PageTransition>
      <ErrorBoundary sectionName="Contatos">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie todos os seus contatos ({pagination.total} total)
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos por nome, email ou telefone..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            </Card>

            {extractedTags && extractedTags.length > 0 && (
              <Card className="p-4">
                <TagFilter value={selectedTags} onChange={handleTagChange} tags={extractedTags} />
              </Card>
            )}
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onContactDeleted={handleContactDeleted}
              />
            ))}
          </div>

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pagination.limit + 1} a{' '}
                {Math.min(page * pagination.limit, pagination.total)} de {pagination.total} contatos
              </div>
            </Card>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </div>

              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>

        {/* Modal de Criar Contato */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Contato</DialogTitle>
              <DialogDescription>Preencha os dados do novo contato abaixo</DialogDescription>
            </DialogHeader>

            <div className="mt-4 pr-4">
              <ContactForm
                mode="create"
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
              />
            </div>
          </DialogContent>
        </Dialog>
      </ErrorBoundary>
    </PageTransition>
  );
}
