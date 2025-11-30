'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDealSchema, updateDealSchema } from '@/lib/validations/deal';
import { DealWithRelations, PipelineStage } from '@/types/deal';
import { ContactAutocomplete } from './contact-autocomplete';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

type CreateDealForm = z.infer<typeof createDealSchema>;
type UpdateDealForm = z.infer<typeof updateDealSchema>;

interface DealFormProps {
  mode: 'create' | 'edit';
  initialData?: DealWithRelations;
  stages: PipelineStage[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DealForm({ mode, initialData, stages, onSuccess, onCancel }: DealFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // Choose schema based on mode
  const schema = mode === 'edit' ? updateDealSchema : createDealSchema;

  const form = useForm<CreateDealForm | UpdateDealForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      value: initialData?.value ?? undefined,
      contact_id: initialData?.contact_id || '',
      stage_id: initialData?.stage_id || (stages.length > 0 ? stages[0].id : ''),
      expected_close_date: initialData?.expected_close_date || '',
      description: '',
    },
  });

  // Handle value field as string to allow clearing zero
  const [valueString, setValueString] = useState(
    initialData?.value ? initialData.value.toString() : ''
  );

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValueString(value);
    const numValue = value === '' ? undefined : parseFloat(value);
    form.setValue('value', numValue);
  };

  async function onSubmit(data: CreateDealForm | UpdateDealForm) {
    setLoading(true);
    try {
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const url = mode === 'edit' ? `/api/deals/${initialData?.id}` : '/api/deals';
      
      // eslint-disable-next-line no-console
      console.log('Deal Form Submit:', { mode, method, url, data, initialDataId: initialData?.id });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // eslint-disable-next-line no-console
        console.error('Response error:', errorData);
        throw new Error(errorData.error || `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} negócio`);
      }

      const responseData = await response.json();
      // eslint-disable-next-line no-console
      console.log('Success response:', responseData);

      toast({
        title: 'Sucesso',
        description: `Negócio ${mode === 'edit' ? 'atualizado' : 'criado'} com sucesso!`,
      });
      onSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} negócio:`, error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} negócio`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Venda de software para empresa X"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor */}
        <FormField
          control={form.control}
          name="value"
          render={() => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={valueString}
                  onChange={handleValueChange}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contato */}
        <FormField
          control={form.control}
          name="contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato *</FormLabel>
              <FormControl>
                <ContactAutocomplete
                  value={field.value}
                  onSelect={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estágio */}
        <FormField
          control={form.control}
          name="stage_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estágio *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estágio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data Esperada */}
        <FormField
          control={form.control}
          name="expected_close_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Esperada de Fechamento</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o negócio..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar Negócio' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
