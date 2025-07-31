import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token');

  // Permitir acesso livre à página de login e rotas de API
  if (pathname.startsWith('/api') || pathname === '/login') {
    return NextResponse.next();
  }

  // Se não houver token, redirecionar para login
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};