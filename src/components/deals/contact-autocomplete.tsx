'use client';

import { useEffect, useState } from 'react';
import { Contact } from '@/types/contact';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactAutocompleteProps {
  value?: string;
  onSelect: (contactId: string) => void;
  disabled?: boolean;
}

export function ContactAutocomplete({ value, onSelect, disabled }: ContactAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();

  const debouncedQuery = useDebounce(query, 300);

  // Carregar todos os contatos ao abrir o dropdown (sem query)
  useEffect(() => {
    if (open && results.length === 0 && !query) {
      searchContacts('');
    }
  }, [open]);

  // Buscar contatos quando o query muda
  useEffect(() => {
    if (debouncedQuery.length === 0) {
      // Se vazio, mostra todos (apenas se dropdown está aberto)
      if (open) {
        searchContacts('');
      }
      return;
    }

    searchContacts(debouncedQuery);
  }, [debouncedQuery, open]);

  // Encontrar contato selecionado quando value muda
  useEffect(() => {
    if (value && results.length > 0) {
      const contact = results.find((c) => c.id === value);
      setSelectedContact(contact);
    }
  }, [value, results]);

  async function searchContacts(searchQuery: string) {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/contacts?search=${encodeURIComponent(searchQuery)}&limit=50`
        : `/api/contacts?limit=50`; // Sem query, retorna todos
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar contatos');
      }
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectContact = (contactId: string) => {
    const contact = results.find((c) => c.id === contactId);
    setSelectedContact(contact);
    onSelect(contactId);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedContact ? selectedContact.name : 'Selecionar contato...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar contato..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Buscando...</span>
              </div>
            )}
            {!loading && results.length === 0 && query.length >= 2 && (
              <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
            )}
            {!loading && results.length === 0 && !query && (
              <CommandEmpty>Clique para carregare contatos...</CommandEmpty>
            )}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={() => handleSelectContact(contact.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === contact.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{contact.name}</span>
                      {contact.email && (
                        <span className="text-sm text-muted-foreground">{contact.email}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
