'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar e-mail',
          description: error.message,
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao enviar o e-mail. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
        <CardDescription className="text-center">
          {emailSent ? 'E-mail enviado com sucesso!' : 'Digite seu e-mail para receber instruções'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de
              entrada e spam.
            </p>
            <Button variant="outline" onClick={() => setEmailSent(false)} className="w-full">
              Enviar novamente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}
