/**
 * Função para obter a URL base da aplicação
 * Funciona tanto no cliente quanto no servidor
 */
export function getAppUrl(): string {
  // Em ambiente de servidor (API routes, server components)
  if (typeof window === 'undefined') {
    // Prioridade: variável de ambiente > header Host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      return appUrl;
    }
    // Fallback (deve ser configurado no servidor)
    return 'https://sistema-crm-simples-zeb2.vercel.app';
  }

  // Em ambiente cliente
  // Prioridade: variável de ambiente > window.location.origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }

  // Fallback para window.location.origin
  return window.location.origin;
}

/**
 * Função para obter a URL de callback (redirecionar após ação)
 * @param path - Caminho relativo (ex: '/update-password')
 * @returns URL completa
 */
export function getCallbackUrl(path: string): string {
  const baseUrl = getAppUrl();
  // Garantir que o path comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
