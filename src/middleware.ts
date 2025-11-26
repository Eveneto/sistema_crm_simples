import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de autenticação do Next.js
 * Protege rotas do dashboard e atualiza sessão do Supabase
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Atualizar sessão (importante para manter usuário logado)
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Tratar erros de autenticação
    if (error) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Middleware auth error:', error);
      }

      // Se houver erro e está tentando acessar dashboard, redirecionar para login
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Para outras rotas, permitir acesso
      return response;
    }

    // Se não está autenticado e está tentando acessar dashboard
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se está autenticado e está tentando acessar login/register
    if (
      user &&
      (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    // Erro fatal: logar e redirecionar para login se estiver tentando acessar área protegida
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware fatal error:', error);
    }

    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
