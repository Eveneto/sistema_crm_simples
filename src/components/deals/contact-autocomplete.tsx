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

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    searchContacts(debouncedQuery);
  }, [debouncedQuery]);

  async function searchContacts(searchQuery: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts?search=${encodeURIComponent(searchQuery)}&limit=10`);
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

  const selectedContact = results.find((contact) => contact.id === value);

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
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={() => {
                      onSelect(contact.id);
                      setOpen(false);
                      setQuery('');
                    }}
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
