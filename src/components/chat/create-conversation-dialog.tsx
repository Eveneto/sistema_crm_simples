/**
 * Create Conversation Dialog
 * Modal para criar uma nova conversa com um contato
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Contact } from '@/types/contact';

interface CreateConversationDialogProps {
  contacts: Contact[];
  onConversationCreated?: (conversationId: string) => void;
}

export function CreateConversationDialog({
  contacts,
  onConversationCreated,
}: CreateConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!selectedContactId) {
      toast({
        title: 'Erro',
        description: 'Selecione um contato',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContactId,
          channel_id: 'whatsapp',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conversa');
      }

      const data = await response.json();
      
      toast({
        title: 'Sucesso',
        description: 'Conversa criada com sucesso!',
      });

      setOpen(false);
      setSelectedContactId('');
      onConversationCreated?.(data.conversation.id);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar conversa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conversa</DialogTitle>
          <DialogDescription>
            Selecione um contato para iniciar uma conversa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Contato
            </label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contato..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading || !selectedContactId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Criando...' : 'Criar Conversa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
