// ============================================
// Page: /dashboard/automations/[id]
// Sprint 3 - US-026
// ============================================

import { AutomationForm } from '@/components/automations/automation-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { AutomationRule } from '@/types/automation';

type EditAutomationPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: EditAutomationPageProps): Promise<Metadata> {
  return {
    title: `Editar Automação ${params.id} | CRM`,
    description: 'Editar regra de automação',
  };
}

export default async function EditAutomationPage({ params }: EditAutomationPageProps) {
  const supabase = await createClient();

  // Buscar automação
  const { data: automation, error } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !automation) {
    notFound();
  }

  // Cast para o tipo correto
  const automationData = automation as AutomationRule;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/automations">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Automação</h1>
        <p className="text-muted-foreground mt-2">
          Modifique as configurações da automação &quot;{automationData.name}&quot;
        </p>
      </div>

      {/* Form */}
      <AutomationForm mode="edit" initialData={automationData} />
    </div>
  );
}
