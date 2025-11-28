// ============================================
// Page: /dashboard/automations
// Sprint 3 - US-026
// ============================================

import { AutomationList } from '@/components/automations/automation-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automações | CRM',
  description: 'Gerencie suas automações de funil',
};

export default function AutomationsPage() {
  return (
    <div className="container mx-auto py-8">
      <AutomationList />
    </div>
  );
}
