import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the base path from the environment or use default
  const basePath = process.env.NODE_ENV === 'production' ? '/Finalgrowthh' : '';

  // Auth pages redirect - Immediate redirect if session exists
  if (session && (req.nextUrl.pathname === `${basePath}/` || req.nextUrl.pathname.startsWith(`${basePath}/auth`))) {
    return NextResponse.redirect(new URL(`${basePath}/dashboard`, req.url));
  }

  // Protected routes - Immediate redirect if no session
  if (!session && req.nextUrl.pathname.startsWith(`${basePath}/dashboard`)) {
    return NextResponse.redirect(new URL(`${basePath}/`, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};