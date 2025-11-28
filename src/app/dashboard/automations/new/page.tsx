// ============================================
// Page: /dashboard/automations/new
// Sprint 3 - US-026
// ============================================

import { AutomationForm } from '@/components/automations/automation-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nova Automação | CRM',
  description: 'Criar nova regra de automação',
};

export default function NewAutomationPage() {
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
        <h1 className="text-3xl font-bold">Nova Automação</h1>
        <p className="text-muted-foreground mt-2">
          Configure uma nova regra de automação para seu funil de vendas
        </p>
      </div>

      {/* Form */}
      <AutomationForm mode="create" />
    </div>
  );
}
