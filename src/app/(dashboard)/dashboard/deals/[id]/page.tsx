'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DealForm } from '@/components/deals/deal-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DealWithRelations, PipelineStage } from '@/types/deal';

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDealAndStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  async function fetchDealAndStages() {
    try {
      const supabase = createClient();

      // Verificar autenticação
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Buscar estágios
      const { data: stagesData, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position', { ascending: true });

      if (stagesError) {
        // eslint-disable-next-line no-console
        console.error('Error fetching stages:', stagesError);
        setError('Erro ao buscar estágios');
        return;
      }

      // Buscar negócio
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(id, name, email),
          stage:deal_stages(id, name, color)
        `)
        .eq('id', dealId)
        .single();

      if (dealError || !dealData) {
        // eslint-disable-next-line no-console
        console.error('Error fetching deal:', dealError);
        setError('Negócio não encontrado');
        return;
      }

      // Formatar stages com fields vazios
      const formattedStages: PipelineStage[] = (stagesData as Array<Record<string, unknown>>).map((stage: Record<string, unknown>) => ({
        id: stage.id as string,
        name: stage.name as string,
        color: stage.color as string,
        order: stage.order as number,
        deals: [],
        count: 0,
        totalValue: 0,
      }));

      setDeal(dealData as DealWithRelations);
      setStages(formattedStages);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching deal data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  const handleSuccess = () => {
    router.push('/dashboard/deals/pipeline');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Negócio não encontrado'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{deal.title}</h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações do negócio
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Editar Negócio</CardTitle>
          <CardDescription>
            Modifique os dados do negócio. Campos com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm
            mode="edit"
            initialData={deal}
            stages={stages}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
