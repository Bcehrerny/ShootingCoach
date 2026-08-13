import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, isValidPasscode } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  if (!isValidPasscode(passcode)) {
    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, passcode, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  return res;
}
