'use client';

import { useEffect, useState } from 'react';
import { Contact, ContactListResponse } from '@/types/contact';
import { ContactCard } from './contact-card';
import { TagFilter } from './tag-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ContactsListSkeleton } from './contacts-list-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedTags]);

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  async function fetchAvailableTags() {
    try {
      // Usar endpoint otimizado /api/tags (5-6x mais rápido)
      const response = await fetch('/api/tags');

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch tags, using fallback');
        return;
      }

      const data = await response.json();

      if (data.tags && Array.isArray(data.tags)) {
        setAvailableTags(data.tags);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Error fetching tags:', err);
      // Silenciosamente falha - tags são feature secundária
    }
  }

  async function fetchContacts() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        orderBy: 'created_at',
        orderDirection: 'desc',
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/contacts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar contatos');
      }

      const data: ContactListResponse = await response.json();
      setContacts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1); // Reset para primeira página ao buscar
  }

  function handlePreviousPage() {
    if (pagination.hasPrev) {
      setPage((p) => p - 1);
    }
  }

  function handleNextPage() {
    if (pagination.hasNext) {
      setPage((p) => p + 1);
    }
  }

  if (loading && contacts.length === 0) {
    return <ContactsListSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca e Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou empresa..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <TagFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {/* Lista */}
      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {search ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? 'Tente buscar com outros termos' : 'Comece adicionando seu primeiro contato'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {contacts.length} de {pagination.total} contatos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
