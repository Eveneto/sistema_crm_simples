'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/validations/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  initialData?: Partial<ContactFormData>;
  mode?: 'create' | 'edit';
  contactId?: string;
  onSuccess?: () => void;
}

export function ContactForm({ 
  initialData, 
  mode = 'create',
  contactId,
  onSuccess 
}: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      position: initialData?.position || '',
      tags: initialData?.tags || [],
      notes: initialData?.notes || '',
    },
  });

  const tags = watch('tags');

  async function onSubmit(data: ContactFormData) {
    try {
      setIsSubmitting(true);

      const url = mode === 'create' 
        ? '/api/contacts' 
        : `/api/contacts/${contactId}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Conflito - contato já existe
          toast({
            title: 'Contato já existe',
            description: result.details?.message || 'Este contato já está cadastrado',
            variant: 'destructive',
          });
          return;
        }

        throw new Error(result.error || 'Erro ao salvar contato');
      }

      toast({
        title: mode === 'create' ? 'Contato criado!' : 'Contato atualizado!',
        description: mode === 'create' 
          ? 'O contato foi adicionado com sucesso' 
          : 'As alterações foram salvas',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/contacts');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar contato',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Nome completo do contato"
          {...register('name')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email e Telefone - Lado a lado */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email {mode === 'create' && <span className="text-muted-foreground text-xs">(email ou telefone obrigatório)</span>}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contato@empresa.com"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefone {mode === 'create' && <span className="text-muted-foreground text-xs">(email ou telefone obrigatório)</span>}
          </Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            {...register('phone')}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Empresa e Cargo - Lado a lado */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            placeholder="Nome da empresa"
            {...register('company')}
            disabled={isSubmitting}
          />
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input
            id="position"
            placeholder="Ex: Diretor de TI, CEO"
            {...register('position')}
            disabled={isSubmitting}
          />
          {errors.position && (
            <p className="text-sm text-destructive">{errors.position.message}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <TagInput
          value={tags}
          onChange={(newTags: string[]) => setValue('tags', newTags)}
          placeholder="Adicionar tag (ex: cliente, lead, enterprise)"
          disabled={isSubmitting}
        />
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Observações sobre o contato..."
          rows={4}
          {...register('notes')}
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Criar Contato' : 'Salvar Alterações'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
