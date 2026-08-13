import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(params.id);
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ session });
  } catch (err: any) {
    console.error('get session error', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to load session.' }, { status: 500 });
  }
}
