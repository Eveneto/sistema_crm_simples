import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'CRM Simplificado - Login',
  description: 'Sistema de CRM para gestão de clientes e vendas',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
