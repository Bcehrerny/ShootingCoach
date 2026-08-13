import { NextRequest, NextResponse } from 'next/server';
import { listSessions } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const shooterId = req.nextUrl.searchParams.get('shooterId') || 'default';
  try {
    const sessions = await listSessions(shooterId);
    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error('list sessions error', err);
    return NextResponse.json(
      { error: 'Could not load sessions. Has the database been initialized with schema.sql?', sessions: [] },
      { status: 200 }
    );
  }
}
