'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/task-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nova Tarefa</CardTitle>
          <CardDescription>Crie uma nova tarefa ou lembrete</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            onSuccess={() => router.push('/dashboard/tasks')}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
