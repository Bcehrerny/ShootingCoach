import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from './lib/auth';

export function middleware(req: NextRequest) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) return NextResponse.next(); // open access if no passcode set

  if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === expected) return NextResponse.next();

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
